const { z } = require('zod');

// Esquema base para registrar un Profesor (POST)
const createTeacherSchema = z.object({
    body: z.object({
        cedula: z.string()
            .trim()
            .min(6, "La cédula debe tener al menos 6 caracteres.")
            .max(10, "La cédula no puede exceder los 10 caracteres.")
            .regex(/^[VEve]?\d+$/, "La cédula debe contener solo números, o iniciar con V o E."),
            
        nombre: z.string()
            .trim()
            .min(2, "El nombre debe tener al menos 2 caracteres.")
            .max(50, "El nombre no puede exceder los 50 caracteres."),
            
        apellido: z.string()
            .trim()
            .min(2, "El apellido debe tener al menos 2 caracteres.")
            .max(50, "El apellido no puede exceder los 50 caracteres."),
            
        telefono: z.string()
            .trim()
            .regex(/^\d{11}$/, "El teléfono debe tener exactamente 11 dígitos numéricos (ej: 04121234567).")
            .optional()
            .nullable(), // Permite que no lo envíen o que venga como null
            
        email: z.string()
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
    })
});

// Esquema para editar un Profesor (PUT)
const updateTeacherSchema = z.object({
    body: createTeacherSchema.shape.body.partial()
});

module.exports = {
    createTeacherSchema,
    updateTeacherSchema
};