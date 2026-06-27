const { Registration, Student, Section, Representative, sequelize } = require('../models');
const { updateStudentSchema } = require('../schemas/studentSchema'); 
const { updateRegistrationSchema } = require('../schemas/registrationSchema');

const { Op } = require('sequelize');

const getAllRegistrations = async (req, res) => {
    try {
        // 1. Capturamos los parámetros que envía el frontend
        // Agregamos section_id para capturar el UUID directo si se requiere para reportes o sábanas
        const { search, year, section, status, section_id } = req.query;

        // 2. Inicializamos los bloques de condiciones dinámicas vacíos
        let studentWhere = {};
        let sectionWhere = {};

        // 🛠️ MODO REPORTE/SÁBANA: Si viene section_id, ignoramos los filtros de texto o combos generales
        if (section_id && section_id.trim() !== '') {
            sectionWhere.id = section_id;
        } else {
            // MODO LISTADO COMÚN: Se ejecutan tus filtros tradicionales si NO hay section_id
            
            // 🔍 FILTRO DE TEXTO: Búsqueda global (Cédula, Nombre, Apellido)
            if (search && search.trim() !== '') {
                studentWhere[Op.or] = [
                    { cedula: { [Op.iLike]: `%${search.trim()}%` } },
                    { nombre: { [Op.iLike]: `%${search.trim()}%` } },
                    { apellido: { [Op.iLike]: `%${search.trim()}%` } }
                ];
            }

            // 🎯 FILTRO DE ESTATUS
            if (status && status !== 'Todos' && status.trim() !== '') {
                studentWhere.estado = status.toLowerCase(); 
            }

            // 🎯 FILTRO DE AÑO (Grado)
            if (year && year !== 'Todos' && year.trim() !== '') {
                sectionWhere.grado = year.trim().charAt(0); 
            }

            // 🎯 FILTRO DE SECCIÓN (Letra)
            if (section && section !== 'Todas' && section.trim() !== '') {
                sectionWhere.seccion = section.toUpperCase().trim();
            }
        }

        // 3. PAGINACIÓN CONDICIONAL: Si viene section_id no limitamos el resultado (trae la sección entera)
        const isReportMode = !!(section_id && section_id.trim() !== '');
        
        const page = parseInt(req.query.page) || 1;
        const limit = isReportMode ? null : (parseInt(req.query.limit) || 5);
        const offset = isReportMode ? null : ((page - 1) * limit);

        // 4. Ejecutamos la consulta relacional con Sequelize
        const { count, rows } = await Registration.findAndCountAll({
            distinct: true, 
            ...(limit !== null && { limit }),
            ...(offset !== null && { offset }),
            include: [
                {
                    model: Section,
                    attributes: ['id', 'grado', 'seccion', 'anio_escolar'],
                    // Si el objeto de condiciones tiene filtros aplicados, los añade
                    ...(Object.keys(sectionWhere).length > 0 && { where: sectionWhere })
                },
                {
                    model: Student,
                    attributes: ['id', 'cedula', 'nombre', 'apellido', 'estado', 'createdAt', 'fecha_nacimiento', 'genero', 'direccion'],
                    ...(Object.keys(studentWhere).length > 0 && { where: studentWhere }),
                    include: [
                        {
                            model: Representative,
                            as: 'Representative',
                            attributes: ['id', 'nombre', 'apellido', 'cedula', 'telefono']
                        }
                    ]
                }
            ],
            // Ordenación alfabética estricta para el formato oficial
            order: [[Student, 'apellido', 'ASC']]
        });

        // 5. Retornamos la respuesta estructurada respetando el estándar
        return res.status(200).json({
            status: 'success',
            totalItems: count,
            totalPages: isReportMode ? 1 : Math.ceil(count / limit),
            currentPage: isReportMode ? 1 : page,
            data: rows
        });

    } catch (error) {
        console.error('Error al obtener inscripciones en SAGES:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el listado académico',
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



const updateFullRegistration = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        // 🛠️ RECIBIMOS: tipo_inscripcion desde el cuerpo de la petición
        const { 
            grado, 
            seccion, 
            tipo_inscripcion, 
            cedula, 
            nombre, 
            apellido, 
            fecha_nacimiento, 
            genero, 
            direccion 
        } = req.body;

        // 1. Buscamos la inscripción
        const registration = await Registration.findByPk(id, { transaction: t });
        if (!registration) throw new Error("Inscripción no encontrada.");

        // 2. Buscamos al estudiante
        const student = await Student.findByPk(registration.student_id, { transaction: t });
        if (!student) throw new Error("Estudiante no encontrado.");

        // 3. Buscamos la sección destino
        const section = await Section.findOne({ where: { grado, seccion }, transaction: t });
        if (!section) throw new Error("Sección no encontrada.");

        // 4. Actualizamos el estudiante con sus datos personales
        await student.update(
            { cedula, nombre, apellido, fecha_nacimiento, genero, direccion }, 
            { transaction: t }
        );
        
        // 🛠️ ACTUALIZAMOS la inscripción: Ahora guarda la nueva sección Y la nueva escolaridad
        await registration.update(
            { 
                section_id: section.id, 
                tipo_inscripcion: tipo_inscripcion // 👈 Mapeo directo a la tabla de inscripciones
            }, 
            { transaction: t }
        );

        await t.commit();
        return res.status(200).json({ status: 'success', message: 'Actualización exitosa.' });

    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

const fullEnrollment = async (req, res) => {
    // Iniciamos la transacción única para asegurar la integridad total
    const t = await sequelize.transaction();

    try {
        // Extraemos los bloques tal cual los enviará tu formulario de Nuxt
        const { estudiante, representante, section_id, tipo_inscripcion, observaciones } = req.body;

        // ==========================================
        // 1. COMPROBACIONES PREVIAS (CANDADOS DE INSCRIPCIÓN)
        // ==========================================
        
        // Buscamos si la sección existe de verdad
        const section = await Section.findByPk(section_id, { transaction: t });
        if (!section) {
            await t.rollback();
            return res.status(404).json({ status: 'error', msg: "La sección seleccionada no existe." });
        }

        // Comprobación de cupos máximos de la regla de negocio
        const count = await Registration.count({ where: { section_id }, transaction: t });
        if (count >= section.capacidad) {
            await t.rollback();
            return res.status(400).json({ 
                status: 'error',
                msg: `Sección llena. Cupo máximo: ${section.capacidad}. No se puede registrar al estudiante.` 
            });
        }

        // Si mandan cédula del chamo, verificamos que no exista ya registrado en el sistema
        if (estudiante && estudiante.cedula) {
            const existingStudent = await Student.findOne({ where: { cedula: estudiante.cedula }, transaction: t });
            if (existingStudent) {
                await t.rollback();
                return res.status(400).json({ status: 'error', msg: "Ya existe un estudiante registrado con esa cédula." });
            }
        }


        // ==========================================
        // 2. PROCESAR REPRESENTANTE (LÓGICA DEL STUDENT CONTROLLER)
        // ==========================================
        let finalRepresentativeId = null;

        // CASO A: Si viene el objeto "representante" con datos, lo buscamos o creamos
        if (representante && representante.cedula) {
            const [representative] = await Representative.findOrCreate({
                where: { cedula: representante.cedula },
                defaults: { 
                    nombre: representante.nombre, 
                    apellido: representante.apellido, 
                    telefono: representante.telefono,
                    email: representante.email,
                    parentesco: representante.parentesco 
                },
                transaction: t 
            });
            finalRepresentativeId = representative.id;
        } 
        // CASO B: Si no viene el representante, pero el chamo ya tiene un ID de uno existente
        else if (estudiante && estudiante.representative_id) {
            finalRepresentativeId = estudiante.representative_id;
        }

        // CANDADO DEFINITIVO DEL REPRESENTANTE
        if (!finalRepresentativeId) {
            await t.rollback();
            return res.status(400).json({
                status: "error",
                msg: "Debe enviar los datos completos de un representante o el ID de uno existente."
            });
        }


        // ==========================================
        // 3. CREAR ESTUDIANTE
        // ==========================================
        const newStudent = await Student.create({
            ...estudiante, 
            representative_id: finalRepresentativeId // 🎯 Diana: nunca será undefined
        }, { transaction: t });


        // ==========================================
        // 4. CREAR INSCRIPCIÓN FINAL (AMARRAR TODO)
        // ==========================================
        
        // Por diseño de flujo, sabemos que no tiene inscripción previa porque se acaba de crear el student_id,
        // así que ejecutamos la inserción directa de tu modelo
        const enrollment = await Registration.create({
            student_id: newStudent.id, 
            section_id, 
            tipo_inscripcion: tipo_inscripcion || 'regular',
            observaciones: observaciones || null,
            estado: "confirmada" // Sincronizado con el por defecto de tu schema Zod
        }, { transaction: t });


        // ==========================================
        // 5. CERRAR OPERACIÓN
        // ==========================================
        await t.commit();

        return res.status(201).json({
            status: 'success',
            msg: "Estudiante registrado e inscrito con éxito en SAGES",
            data: {
                student: newStudent,
                enrollment: enrollment
            }
        });

    } catch (error) {
        // Cualquier fallo en el camino (Campos faltantes de BD, caída de red, etc) destruye los inserts intermedios
        await t.rollback();
        console.error("Error en registro completo:", error);
        return res.status(500).json({ 
            status: 'error',
            msg: "Error interno al procesar el registro completo del estudiante",
            error: error.message 
        });
    }
};

module.exports = 
{ 
    registerStudent, 
    saveBulkRegistrations, 
    updateRegistration,
    getAllRegistrations,
    updateFullRegistration,
    fullEnrollment
};