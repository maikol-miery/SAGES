const { AcademicLoad, Teacher, Subject, Section } = require('../models');

const assignTeacher = async (req, res) =>{

    try{
        const {teacher_id, subject_id, section_id, anio_escolar} = req.body;

        const [teacher, subject, section] = await Promise.all([
            Teacher.findByPk(teacher_id),
            Subject.findByPk(subject_id),
            Section.findByPk(section_id)
        ]);

        if(!teacher){
            console.error("profesor no encontrado");
            return res.status(404).json({
                msg:"El profesor ingresado no existe"
            })
        }

        if(!section){
            console.error("seccion no encontrada");
            return res.status(404).json({
                msg:"Seccion no encontrada"
            })
        }

        if(!subject){
            console.error("materia no encontrada");
            return res.status(404).json({
                msg:"La materia seleccionado no existe"
            })
        }

        const existingLoad = await AcademicLoad.findOne({
                where: {
                    teacher_id,
                    subject_id,
                    section_id
                }
            });

            if (existingLoad) {
                return res.status(400).json({
                    msg: "Esta carga académica ya ha sido asignada previamente."
                });
            }

            const newLoad = await AcademicLoad.create({
                teacher_id, 
                subject_id,
                section_id,
                anio_escolar: anio_escolar || "2025-2026", 
                estado: "activo"
            });

            return res.status(201).json({
                msg: "Carga académica asignada exitosamente",
                data: newLoad
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: "Error interno al procesar la carga académica",
            error: error.message
        });
    }
};

const getAcademicLoads = async (req, res) => {
    try {
        const loads = await AcademicLoad.findAll({
            include: [
                { model: Teacher, attributes: ['nombre', 'apellido'] },
                { model: Subject, attributes: ['nombre'] },
                { model: Section, attributes: ['grado', 'seccion'] }
            ]
        });

        if (loads.length === 0) {
            return res.status(200).json({ 
                msg: "No se encontraron cargas académicas registradas.", 
                data: [] 
            });
        }

        return res.json({ data: loads });
    } catch (error) {
        console.error("Error en getAcademicLoads:", error); 
        return res.status(500).json({ 
            msg: "Error interno al obtener la carga académica",
            error: error.message 
        });
    }
};

module.exports = {
    assignTeacher,
    getAcademicLoads
};
