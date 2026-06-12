import { z } from 'zod'

export const representativeSchema = z.object({
    cedula: z.string().min(1, 'La cédula es requerida'),
    nombre: z.string().min(2, 'El nombre es requerido'),
    apellido: z.string().min(2, 'El apellido es requerido'),
    telefono: z.string().min(7, 'El teléfono es requerido'),
    email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
    parentesco: z.string().min(1, 'El parentesco es requerido'),
    direccion: z.string().optional()
})