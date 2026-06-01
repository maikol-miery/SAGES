const { z } = require('zod');

// 1. Reglas base reutilizables (Mantenemos tus potentes Regex 🔥)
const usernameRule = z.string({ required_error: "El nombre de usuario es obligatorio." })
    .trim()
    .min(4, "El nombre de usuario debe tener al menos 4 caracteres.")
    .max(20, "El nombre de usuario no puede exceder los 20 caracteres.")
    .regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, números y guiones bajos (_)");

const passwordRule = z.string({ required_error: "La contraseña es obligatoria." })
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(100, "La contraseña es demasiado larga.")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula.")
    .regex(/[a-z]/, "La contraseña debe tener al menos una letra minúscula.")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número.");

// Campos base que requiere el modelo 'User' obligatoriamente
const userFields = z.object({
    nombre: z.string({ required_error: "El nombre es obligatorio." })
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres."),
        
    apellido: z.string({ required_error: "El apellido es obligatorio." })
        .trim()
        .min(2, "El apellido debe tener al menos 2 caracteres."),
        
    email: z.string({ required_error: "El correo electrónico es obligatorio." })
        .trim()
        .email("El formato del correo electrónico es inválido."),
        
    username: usernameRule,
    password: passwordRule,
    
    rol: z.string()
        .trim()
        .toLowerCase()
        .refine((val) => ['admin', 'secretaria', 'profesor'].includes(val), {
            message: "Rol de usuario inválido. Valores permitidos: admin, secretaria, profesor."
        })
});

// 2. Esquemas finales listos para tus rutas
const registerUserSchema = z.object({
    body: userFields
});

const loginUserSchema = z.object({
    body: z.object({
        username: z.string({ 
            required_error: "El nombre de usuario o correo electrónico es requerido." 
        }).trim(),
        password: z.string({ 
            required_error: "La contraseña es requerida." 
        })
    })
});

// Esquema para actualizar datos comunes (nombre, apellido, email)
const updateUserSchema = z.object({
    body: userFields.omit({ password: true, username: true, rol: true }).partial()
});

// Esquema dedicado para la ruta de cambiar contraseña por seguridad
const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string({ required_error: "Debe ingresar su contraseña actual." }),
        newPassword: passwordRule // Hereda automáticamente todas tus validaciones pro
    })
});

const verifySecurityQuestionsSchema = z.object({
    body: z.object({
        username: z.string({ required_error: "El nombre de usuario es requerido." }),
        answer1: z.string({ required_error: "La primera respuesta es requerida." }).trim(),
        answer2: z.string({ required_error: "La segunda respuesta es requerida." }).trim()
    })
});

const resetPasswordSchema = z.object({
    body: z.object({
        temporaryToken: z.string({ required_error: "El token temporal es requerido." }),
        newPassword: z.string({ required_error: "La nueva contraseña es requerida." }).min(6, "La contraseña debe tener al menos 6 caracteres")
    })
});

const updateProfileSchema = z.object({
    body: z.object({
        nombre: z.string().trim(),
        apellido: z.string().trim(),
        email: z.string().email("Formato de correo inválido.").trim(),
        username: z.string().trim(),
        question1: z.string().trim(),
        answer1: z.string().trim(),
        question2: z.string().trim(),
        answer2: z.string().trim()
    }).partial() // 👈 Toda la magia resumida aquí
});

module.exports = {
    registerUserSchema,
    loginUserSchema,
    updateUserSchema,
    changePasswordSchema,
    verifySecurityQuestionsSchema,
    resetPasswordSchema,
    updateProfileSchema
};