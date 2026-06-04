// backend/src/validations/staffValidation.js
const { z } = require('zod');

// Helper para limpiar strings vacíos que manda el frontend
const emptyToUndefined = (val) => (val === '' ? undefined : val);

// 1. Definimos los campos base con tus validaciones exactas
const staffFields = z.object({
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
        
    // 🛠️ Tu refinamiento de teléfono intacto
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
        .default('activo'),

    // --- Nuevos campos de SAGES ---
    tipo_personal: z.enum(['docente', 'administrativo'], {
        error_map: () => ({ message: "El tipo de personal debe ser 'docente' o 'administrativo'." })
    }).optional(),

    username: z.preprocess(emptyToUndefined, z.string()
        .trim()
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres.")
        .max(30, "El nombre de usuario no puede exceder los 30 caracteres.")
        .optional()),

    password: z.preprocess(emptyToUndefined, z.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres.")
        .optional()),

    rol: z.preprocess(emptyToUndefined, z.enum(['admin', 'secretaria', 'profesor'], {
        error_map: () => ({ message: "El rol seleccionado no es válido." })
    }).optional())
});

// 2. Esquema para CREAR (Aplica validación estricta si deciden crearle cuenta al personal)
const createStaffSchema = z.object({
    body: staffFields.superRefine((data, ctx) => {
        if (data.username || data.password || data.rol) {
            if (!data.username) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Si creas una cuenta, el nombre de usuario es obligatorio.", path: ["username"] });
            }
            if (!data.password) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Si creas una cuenta, la contraseña es obligatoria.", path: ["password"] });
            }
            if (!data.rol) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Si creas una cuenta, el rol es obligatorio.", path: ["rol"] });
            }
        }
    })
});

// 3. Esquema para ACTUALIZAR (Usando .partial() de forma limpia)
const updateStaffSchema = z.object({
    body: staffFields.partial() // Todo se vuelve opcional y NO arrastra el superRefine, ideal para el PUT/PATCH
});

module.exports = {
    createStaffSchema,
    updateStaffSchema
};