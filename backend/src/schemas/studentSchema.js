const { z } = require('zod');

// Definimos los campos base
const studentFields = z.object({
    cedula: z.string({ required_error: "La cédula es requerida." })
        .trim()
        .min(5, "La cédula debe tener al menos 5 caracteres.")
        .max(12, "La cédula es demasiado larga.")
        .regex(
           /^(?:[VEve]?\d+|\d{10,12})$/, 
           "El formato de cédula es inválido."
        ),
        
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
        .nullable(),
        
    estado: z.string()
        .trim()
        .toLowerCase()
        .refine((val) => ['activo', 'retirado', 'graduado'].includes(val), {
            message: "Estado inválido. Valores permitidos: activo, retirado, graduado."
        })
        .default('activo'),

    representative_id: z.string({ required_error: "El ID del representante es requerido." })
        .uuid({
            message: "El ID del representante debe ser un UUID válido."
        })
});

// Definimos los esquemas específicos
const createStudentSchema = z.object({
    body: studentFields
});

const updateStudentSchema = z.object({
    body: studentFields.partial()
});

// Exportamos por separado
module.exports = {
    createStudentSchema,
    updateStudentSchema
};