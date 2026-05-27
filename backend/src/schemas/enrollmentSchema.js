const { z } = require('zod');
const { createStudentSchema } = require('./studentSchema'); 
const { createRepresentativeSchema } = require('./representativeSchema');

const studentBodySchema = createStudentSchema.shape.body;
const representativeBodySchema = createRepresentativeSchema.shape.body;

const enrollmentSchema = z.object({
    body: z.object({
        estudiante: studentBodySchema.extend({
            representative_id: z.string().uuid().optional()
        }),
        representante: representativeBodySchema.optional()
    }).refine((data) => {
        if (!data.estudiante.representative_id && !data.representante) {
            return false;
        }
        return true;
    }, {
        message: "Debe registrar los datos del representante o enviar el ID de uno existente.",
        path: ["representante"]
    })
});

module.exports = { enrollmentSchema };