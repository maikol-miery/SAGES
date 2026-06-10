const { Student, Representative, sequelize } = require('../models');

const registerStudent = async (req, res) => {

    const t = await sequelize.transaction();

    try {
        // 1. Extraemos los dos bloques de forma segura
    const { estudiante, representante } = req.body;
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

    // CANDADO: Si no se cumple ninguna de las dos condiciones, evitamos el desastre
    if (!finalRepresentativeId) {
        await t.rollback();
        return res.status(400).json({
            status: "error",
            message: "Debe enviar los datos completos de un representante o el ID de uno existente."
        });
    }

    // 2. Creamos al estudiante inyectando el ID definitivo
    const newStudent = await Student.create({
        ...estudiante, 
        representative_id: finalRepresentativeId // 🎯 Así nunca será undefined
    }, { transaction: t });

    await t.commit();

    return res.status(201).json({
        message: 'Estudiante procesado con éxito en SAGES',
        data: {
            student: newStudent
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
        // 1. Capturamos la query que manda el frontend (Filtro de búsqueda)
        const { search } = req.query;

        // 2. Construimos el condicional dinámico si el usuario escribe algo
        let condicional = {};
        if (search) {
            condicional = {
                [Op.or]: [
                    { cedula: { [Op.iLike]: `%${search}%` } }, // Cambia a Op.like si usas MySQL en vez de PostgreSQL
                    { nombre: { [Op.iLike]: `%${search}%` } },
                    { apellido: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        // 3. Tu consulta original findAll agregando el filtro dinámico 'where'
        const students = await Student.findAll({
            where: condicional, // 🎯 Filtra solo si viene un query de búsqueda
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

const updateStudent = async (req, res) => {
    const { id } = req.params;
    
    // Clonamos el body por seguridad, aunque ya venga limpio del middleware
    const dataToUpdate = { ...req.body }; 

    try {
        const student = await Student.findByPk(id);
        
        if (!student) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Estudiante no encontrado en el sistema.' 
            });
        }

        // 1. Bloqueamos la modificación de la llave primaria
        delete dataToUpdate.id; 

        // 2. Preparamos los datos en la instancia
        student.set(dataToUpdate); 
        
        // 3. Solo hacemos la petición a la base de datos si hubo cambios reales
        if (student.changed()) {
            await student.save();
        }

        // 4. Recargamos la instancia actual incluyendo la relación fresca
        await student.reload({ 
            include: [{ model: Representative }] 
        });

        return res.status(200).json({ 
            status: 'success', 
            message: 'Datos del estudiante actualizados con éxito.',
            data: { student } 
        });

    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        return res.status(500).json({ 
            status: 'error',
            message: 'Ocurrió un error interno al actualizar los datos.',
            error: error.message 
        });
    }
};

module.exports = {registerStudent, getAllStudents, updateStudent};