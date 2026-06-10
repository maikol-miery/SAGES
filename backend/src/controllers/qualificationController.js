const { Qualification, AcademicLoad, Student, Registration, sequelize } = require('../models');

// 1. REGISTRAR UNA SOLA NOTA (POST /api/qualifications)
const saveQualification = async (req, res, next) => {
    try {
        const { student_id, academic_load_id, lapso, nota, tipo_evaluacion } = req.body;

        const academicLoad = await AcademicLoad.findByPk(academic_load_id);
        if (!academicLoad) {
            return res.status(404).json({ status: "error", message: "La carga académica no existe." });
        }

        const registration = await Registration.findOne({
            where: {
                student_id,
                section_id: academicLoad.section_id 
            }
        });

        if (!registration) {
            return res.status(400).json({ 
                status: "error", 
                message: "El estudiante no se encuentra inscrito en la sección correspondiente a esta carga académica." 
            });
        }

        const existing = await Qualification.findOne({ where: { student_id, academic_load_id, lapso } });
        if (existing) {
            return res.status(409).json({ 
                status: "error", 
                message: "Ya existe una calificación registrada para este alumno en este lapso. Use el método PUT para modificarla." 
            });
        }

        const newQualification = await Qualification.create({
            student_id, academic_load_id, lapso, nota, tipo_evaluacion
        });

        return res.status(201).json({ status: "success", data: newQualification });
    } catch (error) { next(error); }
};

// 2. MODIFICAR UNA SOLA NOTA (PUT /api/qualifications/:id)
const updateQualification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nota, tipo_evaluacion } = req.body;

        const qualification = await Qualification.findByPk(id);
        if (!qualification) {
            return res.status(404).json({ status: "error", message: "La calificación que intenta editar no existe." });
        }

        if (nota !== undefined) qualification.nota = nota;
        if (tipo_evaluacion) qualification.tipo_evaluacion = tipo_evaluacion;

        await qualification.save();
        return res.status(200).json({ status: "success", message: "Calificación modificada exitosamente.", data: qualification });
    } catch (error) { next(error); }
};

// 3. CARGA MASIVA DE PLANILLA CON UPSERT BLINDADO (POST /api/qualifications/bulk)
const saveBulkQualifications = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { academic_load_id, lapso, tipo_evaluacion, notas } = req.body;

        const academicLoad = await AcademicLoad.findByPk(academic_load_id, { transaction: t });
        if (!academicLoad) {
            await t.rollback();
            return res.status(404).json({ status: "error", message: "La carga académica no existe." });
        }

        const resultados = [];

        for (const item of notas) {
            const { student_id, nota } = item;

            // 🔒 CANDADO MASIVO: Verificamos inscripción activa por cada alumno del lote
            const isEnrolled = await Registration.findOne({
                where: {
                    student_id,
                    section_id: academicLoad.section_id
                },
                transaction: t
            });
            
            if (!isEnrolled) {
                // Si uno solo del lote falla, la transacción cancela TODO el paquete de la secretaria
                await t.rollback();
                return res.status(400).json({ 
                    status: "error", 
                    message: `El estudiante con ID ${student_id} no está inscrito formalmente en la sección de esta planilla.` 
                });
            }

            // Lógica de Upsert (Actualiza o crea)
            const existingQualification = await Qualification.findOne({
                where: { student_id, academic_load_id, lapso },
                transaction: t
            });

            if (existingQualification) {
                existingQualification.nota = nota;
                if (tipo_evaluacion) existingQualification.tipo_evaluacion = tipo_evaluacion;
                await existingQualification.save({ transaction: t });
                resultados.push(existingQualification);
            } else {
                const newQualification = await Qualification.create({
                    student_id, academic_load_id, lapso, nota, tipo_evaluacion: tipo_evaluacion || 'continua'
                }, { transaction: t });
                resultados.push(newQualification);
            }
        }

        await t.commit();
        return res.status(200).json({
            status: "success",
            message: `Planilla procesada: ${resultados.length} calificaciones sincronizadas con éxito.`,
            data: resultados
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

module.exports = {
    saveQualification,
    updateQualification,
    saveBulkQualifications
};