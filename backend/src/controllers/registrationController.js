const { Registration, Student, Section, Representative, sequelize } = require('../models');
const { Op } = require('sequelize');

const getAllRegistrations = async (req, res) => {
    try {
        // 1. Capturamos los parámetros de paginación y filtros que envía el frontend
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const { search, year, section, status } = req.query;

        // 2. Inicializamos los bloques de condiciones dinámicas vacíos
        let studentWhere = {};
        let sectionWhere = {};

        // 🔍 FILTRO DE TEXTO: Búsqueda global (Cédula, Nombre, Apellido)
        if (search && search.trim() !== '') {
            studentWhere[Op.or] = [
                { cedula: { [Op.iLike]: `%${search.trim()}%` } },
                { nombre: { [Op.iLike]: `%${search.trim()}%` } },
                { apellido: { [Op.iLike]: `%${search.trim()}%` } }
            ];
        }

        // 🎯 FILTRO DE ESTATUS: Se ejecuta solo si es diferente a 'Todos' y no viene vacío
        if (status && status !== 'Todos' && status.trim() !== '') {
            // Se pasa a minúsculas porque tu base de datos almacena 'activo', 'retirado', etc.
            studentWhere.estado = status.toLowerCase(); 
        }

        // 🎯 FILTRO DE AÑO: Convierte el texto "1er Año", "2do Año" al formato numérico de tu base de datos
        if (year && year !== 'Todos' && year.trim() !== '') {
            // Si viene "1er Año", charAt(0) extrae exactamente "1"
            sectionWhere.grado = year.trim().charAt(0); 
        }

        // 🎯 FILTRO DE SECCIÓN: Se ejecuta solo si selecciona una sección real (A, B, C...)
        if (section && section !== 'Todas' && section.trim() !== '') {
            sectionWhere.seccion = section.toUpperCase().trim();
        }

        // 3. Ejecutamos la consulta relacional con conteo estricto y paginación
        const { count, rows } = await Registration.findAndCountAll({
            distinct: true, // Evita duplicados en el conteo debido a los múltiples JOINs con PostgreSQL
            limit: limit,
            offset: offset,
            include: [
                {
                    model: Section,
                    attributes: ['id', 'grado', 'seccion', 'anio_escolar'],
                    // Si el objeto sectionWhere tiene propiedades, inyecta el condicional; si no, lo ignora
                    ...(Object.keys(sectionWhere).length > 0 && { where: sectionWhere })
                },
                {
                    model: Student,
                    attributes: ['id', 'cedula', 'nombre', 'apellido', 'estado', 'createdAt'],
                    // Si el objeto studentWhere tiene propiedades, inyecta el condicional; si no, lo ignora
                    ...(Object.keys(studentWhere).length > 0 && { where: studentWhere }),
                    include: [
                        {
                            model: Representative,
                            as: 'Representative', // Alias limpio corregido de la base de datos
                            attributes: ['id', 'nombre', 'apellido', 'cedula']
                        }
                    ]
                }
            ],
            // Ordenación alfabética por el apellido del estudiante
            order: [[Student, 'apellido', 'ASC']]
        });

        // 4. Retornamos la respuesta estructurada bajo tu estándar de paginación
        return res.status(200).json({
            status: 'success',
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows
        });

    } catch (error) {
        console.error('Error al obtener inscripciones paginadas en SAGES:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el listado académico paginado',
            error: error.message
        });
    }
};

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

module.exports = 
{ 
    registerStudent, 
    saveBulkRegistrations, 
    updateRegistration,
    getAllRegistrations 
};