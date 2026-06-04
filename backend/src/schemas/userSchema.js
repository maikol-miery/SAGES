// backend/src/schemas/userSchema.js
const { z } = require('zod');

// Helper interno para limpiar strings vacíos del frontend
const emptyToUndefined = (val) => (val === '' ? undefined : val);

// ==========================================
// 1. REGLAS BASE REUTILIZABLES (Tus potentes Regex 🔥)
// ==========================================
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

// Campos base del modelo User
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

// ==========================================
// 2. ESQUEMAS FINALES ADAPTADOS PARA TUS RUTAS
// ==========================================

// Usado en setup admin inicial (Línea 18 de authRoutes)
const registerUserSchema = z.object({
    body: userFields
});

// Cambiado a loginUserSchema para que coincida exactamente con tu línea 19 de authRoutes 
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

// Esquema para actualizar datos comunes (Omit y Partial limpios)
const updateUserSchema = z.object({
    body: userFields.omit({ password: true, username: true, rol: true }).partial()
});

// Ruta de cambiar contraseña (Línea 23 de authRoutes)
const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string({ required_error: "Debe ingresar su contraseña actual." }),
        newPassword: passwordRule 
    })
});

// Verificación de preguntas (Línea 29 de authRoutes)
const verifySecurityQuestionsSchema = z.object({
    body: z.object({
        username: z.string({ required_error: "El nombre de usuario es requerido." }),
        answer1: z.string({ required_error: "La primera respuesta es requerida." }).trim(),
        answer2: z.string({ required_error: "La segunda respuesta es requerida." }).trim()
    })
});

// Reseteo definitivo (Línea 30 de authRoutes)
const resetPasswordSchema = z.object({
    body: z.object({
        temporaryToken: z.string({ required_error: "El token temporal es requerido." }),
        newPassword: passwordRule // 💡 Cambiado a passwordRule para que la nueva clave cumpla con tus mayúsculas/números obligatorios
    })
});

// Modificar Perfil con Blindaje de preguntas (Línea 24 de authRoutes)
const updateProfileSchema = z.object({
    body: z.object({
        nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").optional(),
        apellido: z.string().trim().min(2, "El apellido debe tener al menos 2 caracteres.").optional(),
        email: z.string().email("Formato de correo inválido.").trim().optional(),
        username: usernameRule.optional(), // Reutiliza tu validación de tamaño/caracteres para el cambio de nick
        
        // Transformamos vacíos en undefined para que el .optional() funcione sin chocar con campos vacíos de Nuxt 3
        question1: z.preprocess(emptyToUndefined, z.string().trim().optional()),
        answer1: z.preprocess(emptyToUndefined, z.string().trim().optional()),
        question2: z.preprocess(emptyToUndefined, z.string().trim().optional()),
        answer2: z.preprocess(emptyToUndefined, z.string().trim().optional())
    }).superRefine((data, ctx) => {
        // Validación cruzada relacional
        if (data.question1 && !data.answer1) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe responder a la pregunta de seguridad 1.", path: ["answer1"] });
        }
        if (data.question2 && !data.answer2) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Debe responder a la pregunta de seguridad 2.", path: ["answer2"] });
        }
    })
});

// ==========================================
// 3. EXPORTACIÓN EXPORT-READY
// ==========================================
module.exports = {
    registerUserSchema,
    loginUserSchema,
    updateUserSchema,
    changePasswordSchema,
    verifySecurityQuestionsSchema,
    resetPasswordSchema,
    updateProfileSchema
};