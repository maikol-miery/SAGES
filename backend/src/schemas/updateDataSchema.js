// schemas/updateDataSchema.js
const { z } = require('zod');

const updateDataSchema = z.object({
    // --- Campos de la Sección ---
    grado: z.string({ required_error: "El campo grado es obligatorio." })
        .trim()
        .min(1, "El campo grado es obligatorio.")
        .max(50, "El formato del grado es demasiado largo."),
        
    seccion: z.string({ required_error: "La sección es requerida (ej: A, B, C)." })
        .trim()
        .length(1, "La sección debe ser un solo carácter (ej: A, B, C).")
        .toUpperCase() 
        .regex(/^[A-Za-z]$/, "La sección debe ser una letra de la A a la Z."),

    // --- Campos del Estudiante ---
    cedula: z.string({ required_error: "La cédula es requerida." })
        .trim()
        .min(5, "La cédula debe tener al menos 5 caracteres.")
        .max(12, "La cédula es demasiado larga.")
        .regex(/^(?:[VEve]?\d+|\d{10,12})$/, "El formato de cédula es inválido."),
        
    nombre: z.string({ required_error: "El nombre es requerido." })
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(50, "El nombre no puede exceder los 50 caracteres."),
        
    apellido: z.string({ required_error: "El apellido es requerido." })
        .trim()
        .min(2, "El apellido debe tener al menos 2 caracteres.")
        .max(50, "El apellido no puede exceder los 50 caracteres."),
        
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
            message: "Edad coherente inválida. El estudiante debe tener al menos 11 años de edad para ingresar al bachillerato."
        }),
        
    genero: z.string({ required_error: "El género es requerido." })
        .trim()
        .toUpperCase()
        .refine((val) => ['M', 'F'].includes(val), {
            message: "El género debe ser 'M' (Masculino) o 'F' (Femenino)."
        }),
        
    direccion: z.string()
        .trim()
        .max(255, "La dirección es demasiado larga.")
        .optional()
        .nullable()
});

module.exports = {
    updateDataSchema
};