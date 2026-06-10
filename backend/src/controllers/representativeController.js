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
            attributes: ['id', 'cedula', 'nombre', 'apellido', 'telefono', 'parentesco'],
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

module.exports = {
    getAllRepresentatives
};