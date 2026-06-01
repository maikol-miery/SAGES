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

const updateTeacher = async (req, res) => {
    const { id } = req.params;
    
    const dataToUpdate = { ...req.body }; 

    try {

        const teacher = await Teacher.findByPk(id);
        
        if (!teacher) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Profesor no encontrado en el sistema.' 
            });
        }

        delete dataToUpdate.id; 

        teacher.set(dataToUpdate); 
        
        if (teacher.changed()) {
            await teacher.save();
        }
        
        await teacher.reload();

        return res.status(200).json({ 
            status: 'success', 
            message: 'Datos del profesor actualizados con éxito.',
            data: { teacher } 
        });

    } catch (error) {
        console.error('Error al actualizar profesor:', error);
        return res.status(500).json({ 
            status: 'error',
            message: 'Ocurrió un error interno al actualizar los datos.',
            error: error.message 
        });
    }
};

module.exports = {
    createTeacher,
    getAllTeachers,
    updateTeacher
};