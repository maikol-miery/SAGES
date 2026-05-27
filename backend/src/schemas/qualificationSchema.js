const { z } = require('zod');

// Esquema base para registrar o modificar una Calificación (POST)
const createQualificationSchema = z.object({
    body: z.object({
        student_id: z.string().uuid({
            message: "El ID del estudiante debe ser un UUID válido."
        }),
        
        academic_load_id: z.string().uuid({
            message: "El ID de la carga académica debe ser un UUID válido."
        }),
        
        // Aceptamos números (Zod valida enteros y flotantes por igual)
        nota: z.number()
            .min(0, "La nota mínima permitida es 0.00")
            .max(20, "La nota máxima permitida es 20.00")
            // Forzamos a que tenga máximo 2 decimales para que coincida con el DECIMAL(4,2)
            .refine((val) => {
                const step = val.toString().split('.')[1];
                return !step || step.length <= 2;
            }, { message: "La nota solo puede tener hasta un máximo de 2 decimales." }),
            
        lapso: z.string()
            .trim()
            .toLowerCase()
            // Permitimos formatos comunes que te puedan mandar del front (1, 2, 3 o primer lapso, etc.)
            .refine((val) => ['1', '2', '3', '1er lapso', '2do lapso', '3er lapso'].includes(val), {
                errorMap: () => ({ message: "Lapso escolar inválido. Valores sugeridos: '1', '2' o '3'." })
            }),
            
        tipo_evaluacion: z.string()
            .trim()
            .toLowerCase()
            .refine((val) => ['continua', 'revisión', 'definitiva'].includes(val), {
                message: "Tipo de evaluación inválido. Valores permitidos: continua, revisión, definitiva."
            })
            .default('continua')
    })
});

// Esquema para la actualización (PUT)
const updateQualificationSchema = z.object({
    body: createQualificationSchema.shape.body.partial()
});

module.exports = {
    createQualificationSchema,
    updateQualificationSchema
};