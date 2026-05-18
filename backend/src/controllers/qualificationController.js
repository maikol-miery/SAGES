const { Qualification, AcademicLoad, Student } = require('../models');

const saveQualification = async (req, res) => {
    try {
        const { student_id, academic_load_id, lapso, nota, tipo_evaluacion } = req.body;

        if (nota < 0 || nota > 20) {
            return res.status(400).json({
                msg: "La nota debe estar en el rango de 0 a 20."
            });
        }

        if (!['1', '2', '3'].includes(String(lapso))) {
            return res.status(400).json({
                msg: "El lapso ingresado no es válido. Debe ser '1', '2' o '3'."
            });
        }

        const [student, academicLoad] = await Promise.all([
            Student.findByPk(student_id),
            AcademicLoad.findByPk(academic_load_id)
        ]);

        if (!student) {
            return res.status(404).json({ msg: "El estudiante ingresado no existe." });
        }

        if (!academicLoad) {
            return res.status(404).json({ msg: "La carga académica (relación profesor-materia-sección) no existe." });
        }

        const existingQualification = await Qualification.findOne({
            where: {
                student_id,
                academic_load_id,
                lapso
            }
        });

        if (existingQualification) {
            existingQualification.nota = nota;
            if (tipo_evaluacion) existingQualification.tipo_evaluacion = tipo_evaluacion;
            
            await existingQualification.save();

            return res.status(200).json({
                msg: "Calificación actualizada exitosamente.",
                data: existingQualification
            });
        }

        const newQualification = await Qualification.create({
            student_id,
            academic_load_id,
            lapso,
            nota,
            tipo_evaluacion: tipo_evaluacion || 'continua' 
        });

        return res.status(201).json({
            msg: "Calificación registrada exitosamente.",
            data: newQualification
        });

    } catch (error) {
        console.error("Error en saveQualification:", error);
        return res.status(500).json({
            msg: "Error interno al procesar la calificación.",
            error: error.message
        });
    }
};

module.exports = {
    saveQualification
};