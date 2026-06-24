const { z } = require('zod');

// 1. REGLAS PARA EL ESTUDIANTE (Tus reglas originales)
const studentSubSchema = z.object({
    cedula: z.string({ required_error: "La cédula del estudiante es requerida." })
        .trim()
        .min(5, "La cédula del estudiante debe tener al menos 5 caracteres.")
        .max(12, "La cédula del estudiante es demasiado larga.")
        .regex(/^(?:[VEve]?\d+|\d{10,12})$/, "El formato de cédula del estudiante es inválido."),
        
    nombre: z.string({ required_error: "El nombre del estudiante es requerido." })
        .trim()
        .min(2, "El nombre del estudiante debe tener al menos 2 caracteres.")
        .max(50, "El nombre del estudiante no puede exceder los 50 caracteres."),
        
    apellido: z.string({ required_error: "El apellido del estudiante es requerido." })
        .trim()
        .min(2, "El apellido del estudiante debe tener al menos 2 caracteres.")
        .max(50, "El apellido del estudiante no puede exceder los 50 caracteres."),
        
    fecha_nacimiento: z.string({ required_error: "La fecha de nacimiento es requerida." })
        .date("La fecha de nacimiento debe tener un formato ISO válido (AAAA-MM-DD).")
        .refine((dateStr) => {
            const fechaNacimiento = new Date(dateStr);
            const fechaActual = new Date();
            let edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
            const mes = fechaActual.getMonth() - fechaNacimiento.getMonth();
            if (mes < 0 || (mes === 0 && fechaActual.getDate() < fechaNacimiento.getDate())) {
                edad--;
            }
            return edad >= 11;
        }, {
            message: "El estudiante debe tener al menos 11 años de edad para ingresar al bachillerato."
        }),
        
    genero: z.string({ required_error: "El género es requerido." })
        .trim()
        .toUpperCase()
        .refine((val) => ['M', 'F'].includes(val), {
            message: "El género debe ser 'M' (Masculino) o 'F' (Femenino)."
        }),
    
    direccion: z.string().trim().max(255, "La dirección es demasiado larga.").optional().nullable(),
    
    representative_id: z.string().uuid("El ID del representante debe ser un UUID válido.").optional().nullable()
});

// 2. REGLAS PARA EL REPRESENTANTE (Tus reglas originales)
const representativeSubSchema = z.object({
    cedula: z.string({ required_error: "La cédula del representante es requerida." })
        .trim()
        .min(6, "La cédula del representante debe tener al menos 6 caracteres.")
        .max(10, "La cédula del representante no puede exceder los 10 caracteres.")
        .regex(/^[VEve]?\d+$/, "La cédula del representante debe contener solo números, o iniciar con V o E."),
        
    nombre: z.string({ required_error: "El nombre del representante es requerido." })
        .trim()
        .min(2, "El nombre del representante debe tener al menos 2 caracteres.")
        .max(50, "El nombre del representante no puede exceder los 50 caracteres."),
        
    apellido: z.string({ required_error: "El apellido del representante es requerido." })
        .trim()
        .min(2, "El apellido del representante debe tener al menos 2 caracteres.")
        .max(50, "El apellido del representante no puede exceder los 50 caracteres."),
        
    telefono: z.string({ required_error: "El teléfono del representante es obligatorio." })
        .trim()
        .regex(/^\d{11}$/, "El teléfono debe tener exactamente 11 dígitos numéricos (ej: 04121234567)."),
        
    email: z.string().trim().email("El formato del correo es inválido.").max(100).optional().nullable().or(z.literal('')),
    parentesco: z.string({ required_error: "El parentesco es requerido." }).trim().min(3).max(30)
});

// 3. ESQUEMA RAÍZ (Valida el body completo que manda Nuxt)
const fullRegistrationSchema = z.object({
    body: z.object({
        section_id: z.string({ required_error: "El ID de la sección es requerido." })
            .uuid("El ID de la sección debe ser un UUID válido."),
            
        tipo_inscripcion: z.string({ required_error: "El tipo de inscripción es requerido." })
            .trim()
            .toUpperCase() // 🎯 Transforma a mayúsculas para evitar fallos de case-sensitive
            .refine((val) => ['RG', 'RP', 'MP', 'EQ'].includes(val), {
                message: "Tipo de inscripción inválido. Valores permitidos: RG, RP, MP, EQ."
            }),
            
        observaciones: z.string().trim().max(255).optional().nullable(),
        
        // El estudiante siempre es obligatorio
        estudiante: studentSubSchema,
        
        // El representante es opcional (Caso B)
        representante: representativeSubSchema.optional().nullable()
    })
});

module.exports = { fullRegistrationSchema };