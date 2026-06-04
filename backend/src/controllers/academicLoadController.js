// backend/src/controllers/academicLoadController.js
const { AcademicLoad, Staff, Subject, Section } = require('../models');

const assignTeacher = async (req, res) => {
    try {
        // 🔥 Cambiado teacher_id por staff_id
        const { staff_id, subject_id, section_id, anio_escolar } = req.body;

        const [staff, subject, section] = await Promise.all([
            Staff.findByPk(staff_id),
            Subject.findByPk(subject_id),
            Section.findByPk(section_id)
        ]);

        // 1. Validar que el registro exista en la tabla 'personal'
        if (!staff) {
            console.error("Personal no encontrado");
            return res.status(404).json({
                msg: "El docente ingresado no existe en el sistema."
            });
        }

        // 🛡️ Candado de seguridad para SAGES: Verificar que el personal sea realmente un docente
        if (staff.tipo_personal !== 'docente') {
            console.error("El miembro del personal seleccionado no es un docente");
            return res.status(400).json({
                msg: "El miembro del personal seleccionado no está registrado con el rol de docente."
            });
        }

        if (!section) {
            console.error("Sección no encontrada");
            return res.status(404).json({
                msg: "La sección seleccionada no existe."
            });
        }

        if (!subject) {
            console.error("Materia no encontrada");
            return res.status(404).json({
                msg: "La materia seleccionada no existe."
            });
        }

        // 👀 Buscamos si ya existe usando la nueva columna 'staff_id'
        const existingLoad = await AcademicLoad.findOne({
            where: {
                staff_id,
                subject_id,
                section_id
            }
        });

        if (existingLoad) {
            return res.status(400).json({
                msg: "Esta carga académica ya ha sido asignada previamente."
            });
        }

        // 🚀 Creación del registro con la estructura correcta
        const newLoad = await AcademicLoad.create({
            staff_id, 
            subject_id,
            section_id,
            anio_escolar: anio_escolar || "2026-2027", 
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
                // 👥 Cambiado Teacher por Staff para hacer el INNER JOIN correcto
                { model: Staff, attributes: ['nombre', 'apellido'] },
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

const updateAcademicLoad = async (req, res) => {
    const { id } = req.params;
    const dataToUpdate = { ...req.body };

    try {
        const academicLoad = await AcademicLoad.findByPk(id);

        if (!academicLoad) {
            return res.status(404).json({
                status: 'error',
                message: 'La asignación de carga académica no existe en el sistema.'
            });
        }

        // Protegemos el ID primario de modificaciones accidentales
        delete dataToUpdate.id;

        academicLoad.set(dataToUpdate);

        if (academicLoad.changed()) {
            await academicLoad.save();
        }

        await academicLoad.reload();

        return res.status(200).json({
            status: 'success',
            message: 'Carga académica modificada con éxito.',
            data: { academicLoad }
        });

    } catch (error) {
        console.error('Error al actualizar la carga académica:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error interno al actualizar la carga académica.',
            error: error.message
        });
    }
};

module.exports = {
    assignTeacher, // Mantenemos el nombre de exportación intacto para no romper tus archivos de rutas
    getAcademicLoads,
    updateAcademicLoad
};