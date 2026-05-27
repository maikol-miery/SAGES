const { z } = require('zod');

// Esquema base para registrar un Representante (POST)
const createRepresentativeSchema = z.object({
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
            .regex(/^\d{11}$/, "El teléfono es obligatorio y debe tener exactamente 11 dígitos numéricos (ej: 04121234567)."),
            
        email: z.string()
            .trim()
            .email("El formato del correo electrónico es inválido.")
            .max(100, "El correo electrónico es demasiado largo.")
            .optional()
            .nullable(), // Al ser opcional en BD, permitimos que no venga o sea null
            
        parentesco: z.string()
            .trim()
            .min(3, "El parentesco debe tener al menos 3 caracteres (ej: Madre, Padre, Tío).")
            .max(30, "El campo parentesco es demasiado largo.")
    })
});

// Esquema para editar un Representante (PUT)
const updateRepresentativeSchema = z.object({
    body: createRepresentativeSchema.shape.body.partial()
});

module.exports = {
    createRepresentativeSchema,
    updateRepresentativeSchema
};