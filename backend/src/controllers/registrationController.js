const { Registration, Student, Section, sequelize } = require('../models');

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
            student_id, 
            section_id, 
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

const saveBulkRegistrations = async (req, res, next) => {
    // 1. Iniciamos la transacción administrada por Sequelize
    const t = await sequelize.transaction();
    try {
        const { section_id, tipo_inscripcion, observaciones, estado, estudiantes } = req.body;

        // 2. Verificar que la sección de destino exista
        const section = await Section.findByPk(section_id, { transaction: t });
        if (!section) {
            await t.rollback();
            return res.status(404).json({ status: "error", message: "La sección especificada no existe." });
        }

        const inscritos = [];

        // 3. Iterar sobre el lote de estudiantes
        for (const item of estudiantes) {
            const { student_id } = item;

            // Verificar que el estudiante exista en la institución
            const student = await Student.findByPk(student_id, { transaction: t });
            if (!student) {
                await t.rollback();
                return res.status(404).json({ 
                    status: "error", 
                    message: `El estudiante con ID ${student_id} no está registrado en el sistema.` 
                });
            }

            // Evitar duplicados: Verificamos si ya está inscrito en esta sección
            const alreadyEnrolled = await Registration.findOne({
                where: { student_id, section_id },
                transaction: t
            });

            if (alreadyEnrolled) {
                // Si ya está inscrito, omitimos o puedes lanzar error. Vamos a omitirlo o actualizarlo.
                continue; 
            }

            // Crear la inscripción dentro de la transacción
            const newRegistration = await Registration.create({
                student_id,
                section_id,
                tipo_inscripcion,
                observaciones: observaciones || 'Inscripción masiva por lote',
                estado: estado || 'activo'
            }, { transaction: t });

            inscritos.push(newRegistration);
        }

        // 4. Si todo el lote es válido, consolidamos los datos en PostgreSQL
        await t.commit();
        return res.status(201).json({
            status: "success",
            message: `Proceso completado. ${inscritos.length} estudiantes fueron inscritos exitosamente en la sección.`,
            data: inscritos
        });

    } catch (error) {
        // Si algo explota en el proceso, revertimos todo para no dejar la BD inconsistente
        await t.rollback();
        next(error);
    }
};

const updateRegistration = async (req, res) => {
    const { id } = req.params; // El ID de la inscripción en la tabla Registration
    const dataToUpdate = { ...req.body };

    try {
        const registration = await Registration.findByPk(id);

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'La inscripción especificada no existe en el sistema.'
            });
        }

        // Protegemos campos clave
        delete dataToUpdate.id;
        delete dataToUpdate.student_id; // Generalmente no se mueve al estudiante de ID desde aquí

        registration.set(dataToUpdate);

        if (registration.changed()) {
            await registration.save();
        }

        await registration.reload();

        return res.status(200).json({
            status: 'success',
            message: 'Inscripción actualizada correctamente.',
            data: { registration }
        });

    } catch (error) {
        console.error('Error al actualizar inscripción:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al actualizar la inscripción.',
            error: error.message
        });
    }
};

module.exports = { registerStudent, saveBulkRegistrations, updateRegistration };