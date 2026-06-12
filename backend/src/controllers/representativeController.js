const { Op } = require('sequelize');
const { Representative, Student } = require('../models');

const getAllRepresentatives = async (req, res) => {
    try {
        // 1. Paginación limpia adaptada a tu estándar
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        const { search } = req.query;

        let whereCondition = {};

        // 🔍 Filtro por texto: Cédula, Nombre o Apellido del Representante
        if (search && search.trim() !== '') {
            whereCondition[Op.or] = [
                { cedula: { [Op.iLike]: `%${search.trim()}%` } },
                { nombre: { [Op.iLike]: `%${search.trim()}%` } },
                { apellido: { [Op.iLike]: `%${search.trim()}%` } }
            ];
        }

        // 2. Consulta relacional a PostgreSQL
        const { count, rows } = await Representative.findAndCountAll({
            where: whereCondition,
            distinct: true, // Evita que se duplique el conteo por el JOIN de estudiantes
            limit: limit,
            offset: offset,
            attributes: ['id', 'cedula', 'nombre', 'apellido', 'telefono', 'email', 'parentesco'],
            include: [
                {
                    model: Student,
                    // Usamos 'Students' porque no definiste alias en el hasMany del index.js
                    as: 'Students', 
                    attributes: ['id', 'nombre', 'apellido', 'cedula', 'estado']
                }
            ],
            order: [['apellido', 'ASC']] // Orden alfabético por el apellido del representante
        });

        // 3. Respuesta idéntica a tu formato paginado de SAGES
        return res.status(200).json({
            status: 'success',
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: rows
        });

    } catch (error) {
        console.error('Error al obtener representantes en SAGES:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el listado de representantes',
            error: error.message
        });
    }
};

const updateRepresentative = async (req, res) => {
    try {
        const { id } = req.params;
        const { cedula, nombre, apellido, telefono, email, parentesco, direccion } = req.body;

        // 1. Buscar si el representante existe en PostgreSQL
        const representative = await Representative.findByPk(id);

        if (!representative) {
            return res.status(404).json({
                status: 'error',
                message: 'El representante solicitado no existe en el sistema'
            });
        }

        // 2. Validación opcional: Evitar duplicados de cédula si se está cambiando
        if (cedula && cedula !== representative.cedula) {
            const registeredCedula = await Representative.findOne({ where: { cedula } });
            if (registeredCedula) {
                return res.status(400).json({
                    status: 'error',
                    message: `La cédula ${cedula} ya se encuentra registrada por otro representante`
                });
            }
        }

        // 3. Actualizar campos dinámicamente usando update() de Sequelize
        // Como es PATCH, si un campo no viene en el body, conserva el valor actual en la DB
        await representative.update({
            cedula: cedula !== undefined ? cedula : representative.cedula,
            nombre: nombre !== undefined ? nombre.trim() : representative.nombre,
            apellido: apellido !== undefined ? apellido.trim() : representative.apellido,
            telefono: telefono !== undefined ? telefono : representative.telefono,
            email: email !== undefined ? (email.trim() === '' ? null : email.trim()) : representative.email,
            parentesco: parentesco !== undefined ? parentesco.toLowerCase() : representative.parentesco,
            direccion: direccion !== undefined ? direccion : representative.direccion
        });

        // 4. Respuesta exitosa adaptada a tu estándar de SAGES
        return res.status(200).json({
            status: 'success',
            message: 'Datos del representante actualizados correctamente',
            data: {
                id: representative.id,
                cedula: representative.cedula,
                nombre: representative.nombre,
                apellido: representative.apellido,
                telefono: representative.telefono,
                email: representative.email,
                parentesco: representative.parentesco,
                direccion: representative.direccion
            }
        });

    } catch (error) {
        console.error('Error al actualizar representante en SAGES:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar la actualización',
            error: error.message
        });
    }
};

// No olvides exportarla al final del archivo junto con getAllRepresentatives
module.exports = {
    getAllRepresentatives,
    updateRepresentative
};