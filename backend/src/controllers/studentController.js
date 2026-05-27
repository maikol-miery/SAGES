const { Student, Representative, sequelize } = require('../models');

const registerStudent = async (req, res) => {

    const t = await sequelize.transaction();

    try {
        // 🚀 DESESTRUCTURACIÓN ADAPTADA: Extraemos los dos bloques del req.body
        const { estudiante, representante } = req.body;

        // 1. Buscamos o creamos al representante usando los campos puros de su objeto
        const [representative, created] = await Representative.findOrCreate({
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

        // 2. Creamos al estudiante esparciendo sus datos puros y asociando el RepresentativeId
        const newStudent = await Student.create({
            ...estudiante,                       // Esparce automáticamente: cedula, nombre, apellido, fecha_nacimiento, genero, direccion
            RepresentativeId: representative.id, // Vinculación automática usando tu FK exacta
        }, { transaction: t });

        await t.commit();

        return res.status(201).json({
            message: 'Estudiante y Representante procesados con éxito en SAGES',
            representative_status: created ? 'Nuevo creado' : 'Ya existía',
            data: {
                student: newStudent,
                representative: representative 
            }
        });

    } catch (err) {
        // Corregido el rollback y la referencia a la variable del error (err)
        await t.rollback();
        console.error('Error en registro:', err);
        return res.status(500).json({ 
            message: 'Error al registrar el estudiante', 
            err: err.message 
        });
    }
}

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            include: [{ model: Representative }] 
        });
        return res.status(200).json({
            status: 'success',
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error('Error al obtener estudiantes:', error); 
        return res.status(500).json({
            message: 'Error al obtener los estudiantes', 
            error: error.message 
        });
    }
};

module.exports = {registerStudent, getAllStudents};