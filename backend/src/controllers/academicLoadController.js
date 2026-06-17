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
        const { grado } = req.query; // Recibe "1", "2", "3", etc.

        if (!grado) {
            return res.status(400).json({ msg: "El parámetro grado es requerido." });
        }

        // 1. Buscamos primero todas las secciones registradas para ese grado específico
        const sections = await Section.findAll({
            where: { grado: String(grado) },
            order: [['seccion', 'ASC']]
        });

        // 2. Buscamos las cargas académicas activas de ese grado para armar los joins
        const loads = await AcademicLoad.findAll({
            where: { estado: 'activo' },
            include: [
                { 
                    model: Staff, 
                    as: 'docente', 
                    attributes: ['nombre', 'apellido'] 
                },
                { 
                    model: Subject, 
                    as: 'subject',
                    attributes: ['nombre', 'grado']
                },
                { 
                    model: Section, 
                    as: 'Section',
                    where: { grado: String(grado) } // Filtramos solo las de este año
                }
            ]
        });

        // 3. 🧠 Mapeamos e interconectamos la información para el Front
        const resultadoFinal = sections.map(sec => {
            // Filtramos las materias asignadas específicamente a esta sección ID
            const materiasAsignadas = loads
                .filter(load => load.section_id === sec.id)
                .map(load => ({
                    id: load.id, // ID de la carga para eliminar
                    nombre: load.subject?.nombre || 'Materia sin nombre',
                    docente: load.docente ? `Prof. ${load.docente.nombre} ${load.docente.apellido}` : 'Sin docente asignado'
                }));

            return {
                id: sec.id,
                letra: sec.seccion,       // Pasa la columna 'seccion' (A, B, C...) a la prop 'letra'
                capacidad: sec.capacidad, // Usamos tu columna capacidad por si la quieres mostrar
                materias: materiasAsignadas
            };
        });

        return res.status(200).json({
            status: 'success',
            sections: resultadoFinal
        });

    } catch (error) {
        console.error("Error en getAcademicLoads con PostgreSQL real:", error); 
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