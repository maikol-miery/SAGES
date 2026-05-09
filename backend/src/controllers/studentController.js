const { Student, Representative, sequelize } = require('../models');

const registerStudent = async (req, res) => {

    const t = await sequelize.transaction();

    try {
        
        const {
            //datos del representante
            cedula_repre, nombre_repre, apellido_repre, telefono_repre, email_repre, parentesco_repre,
            //datos estudiante
            cedula_est, nombre_est, apellido_est, fecha_nacimiento, genero, direccion
        } = req.body;

        const [representative, created] = await Representative.findOrCreate({
            where: { cedula: cedula_repre },
            defaults: { 
                nombre: nombre_repre, 
                apellido: apellido_repre, 
                telefono: telefono_repre,
                email: email_repre,
                parentesco: parentesco_repre 
            },
            transaction: t 
        });

        const newStudent = await Student.create({
            cedula: cedula_est,
            nombre: nombre_est,
            apellido: apellido_est,
            fecha_nacimiento,
            genero,
            direccion,
            RepresentativeId: representative.id, // Vinculación automática
        }, { transaction: t });

        await t.commit();

        return res.status(201).json({
            message: 'Estudiante y Representante procesados con éxito',
            student: newStudent,
            representative_status: created ? 'Nuevo creado' : 'Ya existía'
        });

    } catch (err) {
        await t.rollback();
        console.error('Error en registro:', err);
        return res.status(500).json({ 
            message: 'Error al registrar el estudiante', 
            err: error.message 
        });
    }
}

const getAllStudents = async (req, res) =>{
    try {
        const students = await Student.findAll({
            include: [{ model: Representative }] 
        });
        res.json(students);

    } catch (error) {
        console.error('Error al obtener estudiantes:', err);
        return res.status(500).json({
            message: 'error al obtener los estudiantes', 
            err: error.message 
        })
    }

}

module.exports = {registerStudent, getAllStudents};