const { Qualification, AcademicLoad, Student, Registration, EvaluationDetail, Subject, Staff, sequelize } = require('../models');
const { Op } = require('sequelize');

// 1. REGISTRAR UNA SOLA NOTA (POST /api/qualifications)
const saveQualification = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        // req.body ya viene limpio y validado por createQualificationSchema
        const { 
            student_id, 
            academic_load_id, 
            lapso, 
            calificacion_final, 
            puntos_ajuste, 
            puntos_extracatedra, 
            clausula_aplicada, 
            nota_definitiva, 
            observaciones,
            notas_parciales 
        } = req.body;

        // 1. Crear o actualizar la calificación base (Upsert individual)
        const [qualification, created] = await Qualification.findOrCreate({
            where: { student_id, academic_load_id, lapso },
            defaults: {
                calificacion_final,
                puntos_ajuste,
                puntos_extracatedra,
                clausula_aplicada,
                nota_definitiva,
                observaciones
            },
            transaction: t
        });

        if (!created) {
            await qualification.update({
                calificacion_final,
                puntos_ajuste,
                puntos_extracatedra,
                clausula_aplicada,
                nota_definitiva,
                observaciones
            }, { transaction: t });
        }

        // 2. Si se envían notas parciales (1 al 5), las sincronizamos
        if (notas_parciales && notas_parciales.length > 0) {
            await Promise.all(notas_parciales.map(async (p) => {
                const [detail, detailCreated] = await EvaluationDetail.findOrCreate({
                    where: { 
                        qualification_id: qualification.id, 
                        numero_evaluacion: p.numero_evaluacion 
                    },
                    defaults: { nota: p.nota },
                    transaction: t
                });

                if (!detailCreated) {
                    await detail.update({ nota: p.nota }, { transaction: t });
                }
            }));
        }

        await t.commit();
        return res.status(201).json({
            status: 'success',
            message: 'Calificación individual procesada correctamente.',
            data: qualification
        });

    } catch (error) {
        await t.rollback();
        console.error('Error en saveQualification:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al registrar la calificación individual.'
        });
    }
};

// 2. MODIFICAR UNA SOLA NOTA (PUT /api/qualifications/:id)
const updateQualification = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params; // ID de la calificación a modificar
        // req.body validado parcialmente por updateQualificationSchema
        const { notas_parciales, ...updateData } = req.body;

        // 1. Buscar que la calificación exista
        const qualification = await Qualification.findByPk(id);
        if (!qualification) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'La calificación especificada no existe.'
            });
        }

        // 2. Actualizar los campos de la cabecera si vienen en el body
        await qualification.update(updateData, { transaction: t });

        // 3. Actualizar notas parciales específicas si se requiere
        if (notas_parciales && notas_parciales.length > 0) {
            await Promise.all(notas_parciales.map(async (p) => {
                const [detail, detailCreated] = await EvaluationDetail.findOrCreate({
                    where: { 
                        qualification_id: qualification.id, 
                        numero_evaluacion: p.numero_evaluacion 
                    },
                    defaults: { nota: p.nota },
                    transaction: t
                });

                if (!detailCreated) {
                    await detail.update({ nota: p.nota }, { transaction: t });
                }
            }));
        }

        await t.commit();
        return res.status(200).json({
            status: 'success',
            message: 'Calificación actualizada con éxito.'
        });

    } catch (error) {
        await t.rollback();
        console.error('Error en updateQualification:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al actualizar la calificación.'
        });
    }
};

// 3. CARGA MASIVA DE PLANILLA CON UPSERT BLINDADO (POST /api/qualifications/bulk)
const saveBulkQualifications = async (req, res) => {
    // Iniciamos una transacción para asegurar consistencia atómica
    const t = await sequelize.transaction();
    try {
        const { academic_load_id, lapso, estudiantes } = req.body;

        // Procesamos el lote de estudiantes concurrentemente dentro de la transacción
        await Promise.all(estudiantes.map(async (est) => {
            const { 
                student_id, 
                calificacion_final, 
                puntos_ajuste, 
                puntos_extracatedra, 
                clausula_aplicada, 
                nota_definitiva, 
                observaciones,
                notas_parciales 
            } = est;

            // 1. Guardar o actualizar la cabecera de la calificación (Upsert)
            const [qualification, created] = await Qualification.findOrCreate({
                where: { student_id, academic_load_id, lapso },
                defaults: {
                    calificacion_final: Number(calificacion_final),
                    puntos_ajuste: Number(puntos_ajuste),
                    puntos_extracatedra: Number(puntos_extracatedra),
                    clausula_aplicada,
                    nota_definitiva: Number(nota_definitiva),
                    observaciones: observaciones || null
                },
                transaction: t
            });

            if (!created) {
                await qualification.update({
                    calificacion_final: Number(calificacion_final),
                    puntos_ajuste: Number(puntos_ajuste),
                    puntos_extracatedra: Number(puntos_extracatedra),
                    clausula_aplicada,
                    nota_definitiva: Number(nota_definitiva),
                    observaciones: observaciones || null
                }, { transaction: t });
            }

            // 2. Guardar el desglose de las notas parciales
            if (notas_parciales && notas_parciales.length > 0) {
                await Promise.all(notas_parciales.map(async (p) => {
                    
                    // 🚨 CONTROL DE CONTROL: Si la nota está vacía, nula o indefinida, limpiamos Postgres
                    if (p.nota === '' || p.nota === null || p.nota === undefined) {
                        // Si ya existía una nota guardada ahí y el profesor la borró, la eliminamos
                        await EvaluationDetail.destroy({
                            where: { 
                                qualification_id: qualification.id, 
                                numero_evaluacion: p.numero_evaluacion 
                            },
                            transaction: t
                        });
                        return; // Saltamos este registro para que NUNCA llegue un string vacío a Postgres
                    }

                    // Aseguramos que el valor final sea un número puro antes de pasarlo a Sequelize
                    const notaNumerica = Number(p.nota);

                    const [detail, detailCreated] = await EvaluationDetail.findOrCreate({
                        where: { 
                            qualification_id: qualification.id, 
                            numero_evaluacion: p.numero_evaluacion 
                        },
                        defaults: { nota: notaNumerica },
                        transaction: t
                    });

                    if (!detailCreated) {
                        await detail.update({ nota: notaNumerica }, { transaction: t });
                    }
                }));
            }
        }));

        // Si todo el lote se procesó de forma perfecta, consolidamos los cambios en PostgreSQL
        await t.commit();
        return res.status(200).json({
            status: 'success',
            message: 'Acta de Consejo de Sección guardada e instrumentada exitosamente en el sistema.'
        });

    } catch (error) {
        // Si algo falla, deshacemos absolutamente todo para proteger la integridad de los datos
        await t.rollback();
        console.error('Error crítico en saveBulkQualifications:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al procesar el lote de calificaciones. No se guardó ningún cambio.',
            error: error.message
        });
    }
};

// backend/src/controllers/qualificationsController.js
// backend/src/controllers/qualificationsController.js
const getSectionQualifications = async (req, res) => {
    try {
        const { academic_load_id, lapso } = req.params;

        // 1. Verificar que la carga académica exista y obtener su sección
        const academicLoad = await AcademicLoad.findByPk(academic_load_id);
        if (!academicLoad) {
            return res.status(404).json({
                status: 'error',
                message: 'La carga académica especificada no existe.'
            });
        }

        const section_id = academicLoad.section_id;

        // 2. Traer la nómina de estudiantes inscritos en esta sección
        const enrolledStudents = await Registration.findAll({
            where: { section_id },
            include: [{
                model: Student,
                // 🔥 Aseguramos que los atributos coincidan exactamente con tu modelo real
                attributes: ['id', 'cedula', 'nombre', 'apellido'] 
            }],
            // 🔥 Corrección del ordenamiento para que Sequelize no reviente con el modelo incluido
            order: [[{ model: Student }, 'cedula', 'ASC']]
        });

        // 3. Procesar cada estudiante para armar la sábana con el historial analizado
        const rows = await Promise.all(enrolledStudents.map(async (reg) => {
            const student = reg.Student;

            // A. Buscar si ya existen calificaciones guardadas para este estudiante EN EL LAPSO ACTUAL
            const currentQualification = await Qualification.findOne({
                where: {
                    student_id: student.id,
                    academic_load_id,
                    lapso
                },
                include: [{
                    model: EvaluationDetail,
                    as: 'detalles',
                    order: [['numero_evaluacion', 'ASC']]
                }]
            });

            // B. EL CANDADO ANUAL: Calcular puntos consumidos en LAPSOS ANTERIORES
            const pastQualifications = await Qualification.findAll({
                where: {
                    student_id: student.id,
                    academic_load_id,
                    lapso: { [Op.ne]: lapso }
                }
            });

            let puntosAjusteConsumidosAnual = 0;
            let puntosExtracatedraConsumidosAnual = 0;
            let fueAjustadaEnLapsoPasado = false;

            pastQualifications.forEach(q => {
                puntosAjusteConsumidosAnual += parseInt(q.puntos_ajuste || 0);
                puntosExtracatedraConsumidosAnual += parseInt(q.puntos_extracatedra || 0);
                
                if (q.puntos_ajuste > 0 || q.puntos_extracatedra > 0 || q.clausula_aplicada === 'literal_9') {
                    fueAjustadaEnLapsoPasado = true;
                }
            });

            const totalIncentivosAnuales = puntosAjusteConsumidosAnual + puntosExtracatedraConsumidosAnual;
            const materia_bloqueada_anual = totalIncentivosAnuales >= 2 || fueAjustadaEnLapsoPasado;

            // C. Estructurar la respuesta limpia para el Frontend en Nuxt 3
            return {
                student_id: student.id,
                // 🔥 CORRECCIÓN AQUÍ: Mapeamos usando las propiedades reales que extraes del Student ('cedula', 'nombre', 'apellido')
                first_name: student.nombre,
                last_name: student.apellido,
                id_card: student.cedula,
                
                qualification_id: currentQualification ? currentQualification.id : null,
                calificacion_final: currentQualification ? parseFloat(currentQualification.calificacion_final) : 0.00,
                puntos_ajuste: currentQualification ? currentQualification.puntos_ajuste : 0,
                puntos_extracatedra: currentQualification ? currentQualification.puntos_extracatedra : 0,
                clausula_aplicada: currentQualification ? currentQualification.clausula_aplicada : 'ninguna',
                nota_definitiva: currentQualification ? parseFloat(currentQualification.nota_definitiva) : 0.00,
                observaciones: currentQualification ? currentQualification.observaciones : '',
                
                notas_parciales: currentQualification && currentQualification.detalles ? 
                    currentQualification.detalles.map(d => ({
                        numero_evaluacion: d.numero_evaluacion,
                        nota: parseFloat(d.nota)
                    })) : [],
                    
                control_anual: {
                    puntos_consumidos: totalIncentivosAnuales,
                    puntos_disponibles_restantes: Math.max(0, 2 - totalIncentivosAnuales),
                    materia_bloqueada_anual
                }
            };
        }));

        return res.status(200).json({
            status: 'success',
            data: {
                academic_load_id,
                lapso,
                nomina: rows
            }
        });

    } catch (error) {
        console.error('Error en getSectionQualifications:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar las calificaciones de la sección.'
        });
    }
};

const getRawQualificationsBySection = async (req, res) => {
    try {
        const { section_id } = req.params;
        
        // 1. Buscamos los IDs de la carga académica asignada a la sección
        const cargas = await AcademicLoad.findAll({ 
            where: { section_id },
            attributes: ['id']
        });
        const cargaIds = cargas.map(c => c.id);

        // 2. Traemos las notas directas usando el array de IDs
        const calificaciones = await Qualification.findAll({
            where: { academic_load_id: cargaIds }
        });

        return res.status(200).json({
            status: 'success',
            data: calificaciones
        });
    } catch (error) {
        console.error('Error en getRawQualificationsBySection:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};


module.exports = {
    saveQualification,
    updateQualification,
    saveBulkQualifications,
    getSectionQualifications,
    getRawQualificationsBySection
};