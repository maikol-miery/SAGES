const { Registration, Student, Section } = require('../models');

const registerStudent = async (req, res) => {
    try {
        
        const {student_id, section_id, tipo_inscripcion, observaciones} = req.body;

        const student = await Student.findByPk(student_id);
        const section = await Section.findByPk(section_id);

        if(!student || !section){
            return res.status(404).json({
                msg:"Estudiante o seccion no encontrada"
            })
        }

        const existingRegistration = await Registration.findOne({
            where: {
                student_id: student_id,
                section_id: section_id
            }
        });

        if (existingRegistration) {
            return res.status(400).json({
                msg: "El estudiante ya se encuentra inscrito en esta sección."
            });
        }

        const count = await Registration.count({where:{section_id}});
        if(count >= section.capacidad){
            return res.status(400).json({ 
                msg: `Sección llena. Cupo máximo: ${section.capacidad}` 
            });
        }

        const enrollment = await Registration.create({
            StudentId: student_id, // La 'S' mayúscula es la clave aquí
            SectionId: section_id, // La 'S' mayúscula es la clave aquí
            tipo_inscripcion,
            observaciones,
            estado: "activo"
        });

        return res.status(201).json({
            msg: "Inscripción procesada con éxito",
            data: enrollment
        });

    } catch (error) {
        console.error("Error en Registration:", error);
        return res.status(500).json({ 
            msg: "Error interno al procesar la inscripción",
            error: error.message 
        });
    }
};

module.exports = { registerStudent };