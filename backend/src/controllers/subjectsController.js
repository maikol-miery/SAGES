// controllers/subjectController.js
const { Subject } = require('../models');
const { Op } = require('sequelize');

/**
 * 🚀 CREAR MATERIA
 */
const createSubject = async (req, res) => {
    try {
        const {
            abreviatura,
            nombre,
            grado,
            tipo_evaluacion // 🌟 Capturamos la escala (cuantitativa o cualitativa)
        } = req.body;

        // Validamos duplicados exactos en el mismo año escolar
        const existing = await Subject.findOne({
            where: {
                [Op.or]: [
                    { nombre, grado }, 
                    { abreviatura, grado }    
                ]
            }
        });

        if (existing) {
            return res.status(400).json({
                status: 'error',
                msg: "El nombre o la abreviatura ya está en uso para este grado."
            });
        }

        // Creamos el registro en Postgres
        const newSubject = await Subject.create({
            abreviatura,
            nombre,
            grado,
            tipo_evaluacion // Se guardará con su ENUM correspondiente o tomará el default
        });

        return res.status(201).json({
            status: 'success',
            msg: `${nombre} creada de forma exitosa.`,
            newSubject
        });

    } catch (error) {
        console.error('Error al crear la materia en SAGES:', error);
        return res.status(500).json({
            status: 'error',
            msg: `No se pudo crear la materia.`
        });
    }
};

/**
 * 🔍 OBTENER MATERIAS (Paginado + Filtros Avanzados)
 */
const getAllSubjects = async (req, res) => {
    try {
        // 1. Parámetros de paginación y control de flujo
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; 
        const offset = (page - 1) * limit;
        
        // 🌟 Capturamos el nuevo flag 'all' enviado desde el frontend
        const { search, year, type, all } = req.query;

        // Inicializamos el objeto de condiciones
        let subjectWhere = {};

        // Filtro de Texto (Nombre o Abreviatura)
        if (search && search.trim() !== '') {
            subjectWhere[Op.or] = [
                { nombre: { [Op.iLike]: `%${search.trim()}%` } },
                { abreviatura: { [Op.iLike]: `%${search.trim()}%` } }
            ];
        }

        // Filtro por Año / Grado (¡Servirá tanto para "Todos" como para el año exacto que le mandes!)
        if (year && year !== 'Todos' && year.trim() !== '') {
            subjectWhere.grado = year.trim(); 
        }

        // Filtro por Tipo de Evaluación (cuantitativa / cualitativa)
        if (type && type !== 'Todos' && type.trim() !== '') {
            subjectWhere.tipo_evaluacion = type.trim().toLowerCase();
        }

        // 🌟 2. Configuración dinámica de opciones para Sequelize
        // El orden se mantiene siempre igual
        let queryOptions = {
            where: subjectWhere,
            order: [['grado', 'ASC'], ['nombre', 'ASC']]
        };

        // 🌟 SI 'all' NO es true, aplicamos el límite y el offset para paginar la tabla
        if (all !== 'true') {
            queryOptions.limit = limit;
            queryOptions.offset = offset;
        }

        // 3. Consulta estructurada a la Base de Datos con nuestras opciones dinámicas
        const { count, rows } = await Subject.findAndCountAll(queryOptions);

        if (rows.length === 0 && page === 1) {
            return res.status(200).json({
                status: "success",
                message: "No hay materias registradas con los filtros aplicados.",
                subjects: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page
            });
        }

        // 4. Respuesta unificada
        // Si no está paginado, calculamos dinámicamente el totalPages como 1
        return res.status(200).json({
            status: "success",
            totalItems: count,
            totalPages: all === 'true' ? 1 : Math.ceil(count / limit),
            currentPage: page,
            subjects: rows
        });

    } catch (error) {
        console.error('Error al obtener materias paginadas en SAGES:', error);
        return res.status(500).json({
            status: "error",
            msg: "No se pudieron encontrar las materias.",
            error: error.message
        });
    }
};

/**
 * 🛠️ ACTUALIZAR MATERIA
 */
const updateSubject = async (req, res) => {
    const { id } = req.params;
    const dataToUpdate = { ...req.body };

    try {
        // 1. Buscamos la materia por ID
        const subject = await Subject.findByPk(id);

        if (!subject) {
            return res.status(404).json({
                status: 'error',
                message: 'La materia no se encuentra registrada en el sistema.'
            });
        }

        // 2. Protegemos la PK
        delete dataToUpdate.id;

        // 3. Cargamos los cambios en memoria (Postgres actualizará tipo_evaluacion si viene en el body)
        subject.set(dataToUpdate);

        // 4. Guardamos solo si hay mutaciones reales
        if (subject.changed()) {
            await subject.save();
        }

        // 5. Refrescamos la instancia
        await subject.reload();

        return res.status(200).json({
            status: 'success',
            message: 'Materia actualizada con éxito.',
            data: { subject }
        });

    } catch (error) {
        console.error('Error al actualizar la materia en SAGES:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error interno al actualizar la materia.',
            error: error.message
        });
    }
};

const deleteSubject = async (req, res) => {
  const { id } = req.params;

  try {
    // .destroy() ejecutará un Soft Delete gracias al paranoid: true
    const filasAfectadas = await Subject.destroy({
      where: { id }
    });

    // Si devuelve 0, significa que el ID no existía o ya estaba borrado
    if (filasAfectadas === 0) {
      return res.status(404).json({
        status: 'error',
        msg: 'La asignatura no existe o ya fue desincorporada del sistema.'
      });
    }

    return res.status(200).json({
      status: 'success',
      msg: 'Materia desincorporada lógicamente con éxito.'
    });

  } catch (error) {
    console.error('❌ Error en deleteSubject de SAGES:', error);
    return res.status(500).json({
      status: 'error',
      msg: 'Hubo un error interno en el servidor al intentar remover la materia.'
    });
  }
};

module.exports = {
    createSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject
};