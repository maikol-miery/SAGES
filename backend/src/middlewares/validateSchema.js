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
        req.body = validatedData.body;
        req.query = validatedData.query;
        req.params = validatedData.params;
        
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            // 🔬 FORMATEADOR EXTREMO: Si .errors viene vacío, usamos flatten() 
            // que desarma los errores por campos de forma ultra visual para el desarrollador.
            const fieldErrors = error.flatten().fieldErrors;
            
            return res.status(400).json({
                status: 'error',
                message: 'Error de validación en los datos de entrada',
                // Si flatten viene vacío por algún motivo, mandamos los issues clásicos mapeados de forma segura
                errors: Object.keys(fieldErrors).length > 0 ? fieldErrors : error.issues.map(i => ({ campo: i.path.join('.'), mensaje: i.message }))
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