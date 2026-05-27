const { z } = require('zod');

// Esquema base para la creación (POST)
const createStudentSchema = z.object({
    body: z.object({
        cedula: z.string()
            .trim()
            .min(5, "La cédula debe tener al menos 5 caracteres.")
            .max(12, "La cédula es demasiado larga.") // Ampliado para soportar el formato estudiantil largo
            .regex(
               /^(?:[VEve]?\d+|\d{10,12})$/, 
                "El formato de cédula es inválido."
            ),
            
        nombre: z.string()
            .trim()
            .min(2, "El nombre debe tener al menos 2 caracteres.")
            .max(50, "El nombre no puede exceder los 50 caracteres."),
            
        apellido: z.string()
            .trim()
            .min(2, "El apellido debe tener al menos 2 caracteres.")
            .max(50, "El apellido no puede exceder los 50 caracteres."),
            
        fecha_nacimiento: z.string()
            .date("La fecha de nacimiento debe tener un formato ISO válido (AAAA-MM-DD).")
            .refine((dateStr) => {
                const fechaNacimiento = new Date(dateStr);
                const fechaActual = new Date();
                
                // Calculamos la edad de forma exacta
                let edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
                const mes = fechaActual.getMonth() - fechaNacimiento.getMonth();
                
                // Ajustamos si aún no ha cumplido años en el año en curso
                if (mes < 0 || (mes === 0 && fechaActual.getDate() < fechaNacimiento.getDate())) {
                    edad--;
                }
                
                // Regla de negocio: mínimo 11 años para bachillerato
                return edad >= 11;
            }, {
                message: "Edad coherente inválida. El estudiante debe tener al menos 11 años de edad para ingresar al bachillerato."
            }),
            
        // El modelo espera STRING, pero aquí filtramos estrictamente los caracteres válidos
        genero: z.string()
            .trim()
            .toUpperCase() // Convierte automáticamente a mayúsculas si mandan 'm' o 'f'
            .refine((val) => ['M', 'F'].includes(val), {
                message: "El género debe ser 'M' (Masculino) o 'F' (Femenino)."
            }),
        
        direccion: z.string()
            .trim()
            .max(255, "La dirección es demasiado larga.")
            .optional()
            .nullable(),
            
        // El modelo espera STRING, pero aquí controlamos los estados lógicos de SAGES
        estado: z.string()
            .trim()
            .toLowerCase() // Asegura consistencia en minúsculas
            .refine((val) => ['activo', 'retirado', 'graduado'].includes(val), {
                message: "Estado inválido. Valores permitidos: activo, retirado, graduado."
            })
            .default('activo'),

        representative_id: z.string().uuid({
            message: "El ID del representante debe ser un UUID válido."
        })
    })
});

// Esquema para la actualización (PUT)
const updateStudentSchema = z.object({
    body: createStudentSchema.shape.body.partial()
});

module.exports = {
    createStudentSchema,
    updateStudentSchema
};