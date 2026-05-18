const { Teacher } = require('../models');

const createTeacher = async (req, res) => {
    try {
        const { cedula, nombre, apellido, telefono, email} = req.body;

        const existingTeacher = await Teacher.findOne({ where: { cedula } });
        if (existingTeacher) {
            return res.status(400).json({
                msg: "Ya existe un profesor registrado con esa cédula."
            });
        }

        const newTeacher = await Teacher.create({
            cedula,
            nombre,
            apellido,
            telefono,
            email,
            estado: "activo"
        });

        res.status(201).json({
            msg: "Profesor registrado exitosamente",
            data: newTeacher
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al registrar el profesor", error: error.message });
    }
};


const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.findAll({
            where: { estado: "activo" }, 
            order: [['apellido', 'ASC']] 
        });
        res.json({ data: teachers });
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener profesores" });
    }
};

module.exports = {
    createTeacher,
    getAllTeachers
};