const { ZodError } = require('zod');

const validateSchema = (schema) => (req, res, next) => {
    try {
        // 🚀 PASO CLAVE: Validamos la estructura exacta que esperan tus esquemas
        // y reasignamos el body con la data limpia y formateada por Zod (limpia espacios, trimeos, etc.)
        const validatedData = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });

        // Sobrescribimos el req con los datos mutados de Zod para que pasen limpios al controlador
        if (validatedData.body) req.body = validatedData.body;
        if (validatedData.query) req.query = validatedData.query;
        if (validatedData.params) req.params = validatedData.params;
        
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            // 🔬 EL CAMBIO ESTÁ AQUÍ:
            // Mapeamos directamente los 'issues' de Zod para construir un arreglo limpio
            const mappedErrors = error.issues.map(issue => ({
                // issue.path suele ser un arreglo tipo ['body', 'estado']. 
                // Tomamos siempre el último elemento para sacar el nombre real del campo.
                campo: issue.path[issue.path.length - 1], 
                mensaje: issue.message
            }));
            
            return res.status(400).json({
                status: 'error',
                message: 'Error de validación en los datos de entrada',
                errors: mappedErrors // Entregamos el arreglo perfecto para iterar en Nuxt
            });
        }

        console.error("Error inesperado en validación:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor en la validación'
        });
    }
};

module.exports = validateSchema;