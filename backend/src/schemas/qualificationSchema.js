const { z } = require('zod');

// 1. Definimos el objeto puro con las propiedades (sin el .refine al final)
const qualificationBodyObject = z.object({
    student_id: z.string().uuid({
        message: "El ID del estudiante debe ser un UUID válido."
    }),
    
    academic_load_id: z.string().uuid({
        message: "El ID de la carga académica debe ser un UUID válido."
    }),
    
    lapso: z.string()
        .trim()
        .toLowerCase()
        .refine((val) => ['1', '2', '3', '1er lapso', '2do lapso', '3er lapso'].includes(val), {
            message: "Lapso escolar inválido. Valores sugeridos: '1', '2' o '3'."
        }),

    calificacion_final: z.number()
        .min(0, "La calificación mínima permitida es 0.00")
        .max(20, "La calificación máxima permitida es 20.00")
        .refine((val) => {
            const step = val.toString().split('.')[1];
            return !step || step.length <= 2;
        }, { message: "La calificación final solo puede tener hasta 2 decimales." }),

    puntos_ajuste: z.number().int().min(0).max(2, "Máximo 2 puntos de ajuste por promedio."),
    puntos_extracatedra: z.number().int().min(0).max(2, "Máximo 2 puntos por actividades extracátedra."),
    
    clausula_aplicada: z.string()
        .trim()
        .toLowerCase()
        .refine((val) => ['ninguna', 'extracatedra', 'literal_9', 'literal_13'].includes(val), {
            message: "Cláusula inválida. Valores permitidos: ninguna, extracatedra, literal_9, literal_13."
        })
        .default('ninguna'),

    nota_definitiva: z.number()
        .min(0, "La nota mínima permitida es 0.00")
        .max(20, "La nota máxima permitida es 20.00")
        .refine((val) => {
            const step = val.toString().split('.')[1];
            return !step || step.length <= 2;
        }, { message: "La nota definitiva solo puede tener hasta 2 decimales." }),

    observaciones: z.string().trim().nullable().optional()
});

// 2. Ahora sí creamos el esquema de registro aplicando el .refine() sobre el objeto base
const createQualificationSchema = z.object({
    body: qualificationBodyObject.refine((data) => {
        if (data.clausula_aplicada === 'literal_13') return true;
        return (data.puntos_ajuste + data.puntos_extracatedra) <= 2;
    }, {
        message: "La suma de puntos de ajuste y extracátedra no puede superar el límite de 2 puntos por materia.",
        path: ["nota_definitiva"]
    })
});

// 3. Para la actualización, le aplicamos el .partial() al objeto BASE (que no tiene refinamientos globales)
const updateQualificationSchema = z.object({
    body: qualificationBodyObject.partial()
});

// 4. Tu esquema bulk se mantiene idéntico y limpio usando la referencia al objeto base
const createBulkQualificationsSchema = z.object({
    body: z.object({
        academic_load_id: qualificationBodyObject.shape.academic_load_id,
        lapso: qualificationBodyObject.shape.lapso,
        
        estudiantes: z.array(
            z.object({
                student_id: qualificationBodyObject.shape.student_id,
                calificacion_final: qualificationBodyObject.shape.calificacion_final,
                puntos_ajuste: qualificationBodyObject.shape.puntos_ajuste,
                puntos_extracatedra: qualificationBodyObject.shape.puntos_extracatedra,
                clausula_aplicada: qualificationBodyObject.shape.clausula_aplicada,
                nota_definitiva: qualificationBodyObject.shape.nota_definitiva,
                observaciones: qualificationBodyObject.shape.observaciones
            })
        ).nonempty({
            message: "El listado de calificaciones del consejo no puede estar vacío."
        })
    })
});

module.exports = {
    createQualificationSchema,
    updateQualificationSchema,
    createBulkQualificationsSchema
};