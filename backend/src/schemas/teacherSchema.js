const { z } = require('zod');

const teacherFields = z.object({
    cedula: z.string({ required_error: "La cédula es requerida." })
        .trim()
        .min(6, "La cédula debe tener al menos 6 caracteres.")
        .max(10, "La cédula no puede exceder los 10 caracteres.")
        .regex(/^[VEve]?\d+$/, "La cédula debe contener solo números, o iniciar con V o E."),
        
    nombre: z.string({ required_error: "El nombre es requerido." })
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(50, "El nombre no puede exceder los 50 caracteres."),
        
    apellido: z.string({ required_error: "El apellido es requerido." })
        .trim()
        .min(2, "El apellido debe tener al menos 2 caracteres.")
        .max(50, "El apellido no puede exceder los 50 caracteres."),
        
    // 🛠️ REFINAMIENTO EN TELÉFONO:
    // Si usas .regex() directo en un campo .optional().nullable(), Zod se confunde si mandan un string vacío "".
    // Con esta estructura, si no viene o viene null/vacío pasa limpio, pero si escriben algo, los obliga a cumplir los 11 dígitos.
    telefono: z.string()
        .trim()
        .regex(/^\d{11}$/, "El teléfono debe tener exactamente 11 dígitos numéricos (ej: 04121234567).")
        .optional()
        .nullable()
        .or(z.literal('')), 
        
    email: z.string({ required_error: "El correo electrónico es requerido." })
        .trim()
        .email("El formato del correo electrónico es inválido.")
        .max(100, "El correo electrónico es demasiado largo."),
        
    estado: z.string()
        .trim()
        .toLowerCase()
        .refine((val) => ['activo', 'inactivo'].includes(val), {
            message: "Estado inválido. Valores permitidos: activo, inactivo."
        })
        .default('activo')
});

const createTeacherSchema = z.object({
    body: teacherFields
});

const updateTeacherSchema = z.object({
    body: teacherFields.partial()
});

module.exports = {
    createTeacherSchema,
    updateTeacherSchema
};