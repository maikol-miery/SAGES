const { z } = require('zod');

// 1. Esquema para el REGISTRO de usuarios (POST /auth/register)
const registerUserSchema = z.object({
    body: z.object({
        username: z.string()
            .trim()
            .min(4, "El nombre de usuario debe tener al menos 4 caracteres.")
            .max(20, "El nombre de usuario no puede exceder los 20 caracteres.")
            .regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, números y guiones bajos (_)"),
            
        email: z.string()
            .trim()
            .email("El formato del correo electrónico es inválido."),
            
        password: z.string()
            .min(8, "La contraseña debe tener al menos 8 caracteres.")
            .max(100, "La contraseña es demasiado larga.")
            // Candado de seguridad pro: forzar mayúscula, minúscula y un número
            .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula.")
            .regex(/[a-z]/, "La contraseña debe tener al menos una letra minúscula.")
            .regex(/[0-9]/, "La contraseña debe tener al menos un número."),
            
        rol: z.string()
            .trim()
            .toLowerCase()
            .refine((val) => ['admin', 'directivo', 'profesor', 'evaluacion'].includes(val), {
                message: "Rol de usuario inválido."
            })

    })
});

// 2. Esquema para el LOGIN (POST /auth/login)
// Aquí solo pedimos lo necesario para entrar, pero validamos que tenga sentido
const loginUserSchema = z.object({
    body: z.object({
        email: z.string()
            .trim()
            .email("Introduce un correo electrónico válido."),
        password: z.string()
            .min(1, "La contraseña es requerida.")
    })
});

// 3. Esquema para ACTUALIZAR datos del usuario (PUT)
const updateUserSchema = z.object({
    body: registerUserSchema.shape.body.omit({ password: true }).partial() 
    // Omitimos password aquí porque el cambio de clave se suele hacer en otra ruta dedicada por seguridad
});

module.exports = {
    registerUserSchema,
    loginUserSchema,
    updateUserSchema
};