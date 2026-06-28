// backend/src/controllers/staffController.js
const { Staff, User, AcademicLoad, sequelize } = require('../models');
const { Op } = require('sequelize');

// 1. CREAR PERSONAL (Con o sin cuenta de usuario integrada)
const createStaff = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { cedula, nombre, apellido, email, username, password, rol } = req.body;

        // 1. Validar si ya existe el perfil físico
        const staffExists = await Staff.findOne({ where: { [Op.or]: [{ cedula }, { email }] } });
        if (staffExists) {
            await t.rollback();
            return res.status(400).json({ status: 'error', message: 'La cédula o correo electrónico ya están registrados.' });
        }

        // 2. Definir el tipo de personal de forma segura
        // Si no viene rol (profesor sin cuenta), asumimos que es 'docente'
        const tipoPersonal = (rol === 'admin' || rol === 'secretaria') ? 'administrativo' : 'docente';

        // 3. Crear el perfil físico en Staff
        const newStaff = await Staff.create({
            cedula,
            nombre,
            apellido,
            email,
            tipo_personal: tipoPersonal,
            estado: 'activo'
        }, { transaction: t });

        // 4. ✨ EL CANDADO: Solo se crea el usuario si se enviaron credenciales desde la UI
        let newUser = null;
        if (username && password && rol) {
            // Validar que el username no esté en uso antes de proceder
            const usernameExists = await User.findOne({ where: { username } });
            if (usernameExists) {
                await t.rollback();
                return res.status(400).json({ status: 'error', message: 'El nombre de usuario ya está en uso.' });
            }

            newUser = await User.create({
                username,
                password,
                rol,
                staff_id: newStaff.id
            }, { transaction: t });
        }

        await t.commit();

        return res.status(201).json({
            status: 'success',
            message: newUser 
                ? `Personal registrado exitosamente con cuenta de ${newUser.rol}.` 
                : 'Profesor registrado exitosamente (Sin cuenta de acceso).',
            data: {
                staff: newStaff,
                hasAccount: !!newUser
            }
        });
    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error al registrar al miembro del personal.' });
    }
};

// 2. OBTENER TODO EL PERSONAL (Para la tabla de "Gestión de Personal")
const getAllStaff = async (req, res) => {
    try {
        const { tipo_personal } = req.query;

        // 1. Condición base: siempre traer al personal activo
        const whereCondition = { estado: "activo" };

        // 2. Si pasan el filtro por la URL, lo limpiamos y lo agregamos directo al modelo principal
        if (tipo_personal) {
            const tipoLimpio = tipo_personal.replace(/['"]+/g, '').trim().toLowerCase();
            whereCondition.tipo_personal = tipoLimpio; 
        }

        const staffList = await Staff.findAll({
            where: whereCondition, // 🚀 Filtra directo aquí (docente / administrativo)
            include: [{
                model: User,
                as: 'cuenta',
                attributes: ['username', 'rol'] // Solo para pintar info en la tabla general
            }],
            order: [['apellido', 'ASC']] 
        });
        
        return res.json({ data: staffList });
    } catch (error) {
        console.error("Error en getAllStaff:", error);
        return res.status(500).json({ msg: "Error al obtener el personal" });
    }
};

// 3. ACTUALIZAR PERSONAL
const updateStaff = async (req, res) => {
    const { id } = req.params;
    const { 
        cedula, nombre, apellido, telefono, email, tipo_personal, estado,
        username, rol, password 
    } = req.body;
    
    const t = await sequelize.transaction();

    try {
        // Buscamos al miembro del personal junto con su cuenta si la posee
        const staffMember = await Staff.findByPk(id, {
            include: [{ model: User, as: 'cuenta' }]
        });
        
        if (!staffMember) {
            await t.rollback();
            return res.status(404).json({ 
                status: 'error',
                message: 'Miembro del personal no encontrado en el sistema.' 
            });
        }

        // Actualizamos los datos demográficos en Staff
        await staffMember.update({
            cedula, nombre, apellido, telefono, email, tipo_personal, estado
        }, { transaction: t });

        // Manejo de la cuenta de usuario vinculada
        if (staffMember.cuenta) {
            // Si ya tenía cuenta, actualizamos los datos permitidos
            const userUpdateData = { username, rol };
            // Solo si mandan una nueva contraseña desde la UI se actualiza
            if (password && password.trim() !== "") {
                userUpdateData.password = password;
            }
            await staffMember.cuenta.update(userUpdateData, { transaction: t });
        } else if (username && rol && password) {
            // Si no tenía cuenta (ej. era un profesor fantasma) y ahora se le quiere dar acceso al sistema
            await User.create({
                username,
                password,
                rol,
                staff_id: staffMember.id
            }, { transaction: t });
        }

        await t.commit();
        
        // Recargamos el objeto para devolver la data fresca a Nuxt 3
        await staffMember.reload({ include: [{ model: User, as: 'cuenta' }] });

        return res.status(200).json({ 
            status: 'success', 
            message: 'Datos del personal actualizados con éxito.',
            data: staffMember
        });

    } catch (error) {
        await t.rollback();
        console.error('Error en updateStaff:', error);
        return res.status(500).json({ 
            status: 'error',
            message: 'Ocurrió un error interno al actualizar los datos.',
            error: error.message 
        });
    }
};

const getStaffList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const { search, tipo_personal, estado, rol } = req.query;

        // Inicializamos los bloques de condiciones vacíos
        let staffWhere = {};
        let userWhere = {};

        // 1. FILTRO TIPO DE PERSONAL (docente / administrativo)
        if (tipo_personal && tipo_personal.toUpperCase() !== 'TODOS' && tipo_personal.trim() !== '') {
            staffWhere.tipo_personal = tipo_personal.toLowerCase();
        }
        
        // 2. FILTRO ESTADO (activo / inactivo)
        if (estado && estado.toUpperCase() !== 'TODOS' && estado.trim() !== '') {
            staffWhere.estado = estado.toLowerCase();
        }

        // 3. BARRA DE BÚSQUEDA GLOBAL
        if (search && search.trim() !== "") {
            const cleanSearch = `%${search.trim()}%`;
            staffWhere[Op.or] = [
                { cedula: { [Op.iLike]: cleanSearch } },
                { nombre: { [Op.iLike]: cleanSearch } },
                { apellido: { [Op.iLike]: cleanSearch } },
                { email: { [Op.iLike]: cleanSearch } }
            ];
        }

        // 4. FILTRO DE ROL (Se aplica sobre el modelo User)
        if (rol && rol.toUpperCase() !== 'TODOS' && rol.trim() !== '') {
            userWhere.rol = rol.toLowerCase();
        }

        // Ejecutar consulta relacional estructurada
        const { count, rows } = await Staff.findAndCountAll({
            where: staffWhere,
            limit,
            offset,
            order: [['apellido', 'ASC']],
            include: [{
                model: User,
                as: 'cuenta',
                // Si hay un filtro de rol específico, inyectamos el where al include
                ...(Object.keys(userWhere).length > 0 && { where: userWhere }),
                // Si busca un rol específico, required es true (INNER JOIN), si no false (LEFT JOIN)
                required: (rol && rol.toUpperCase() !== 'TODOS') ? true : false, 
                attributes: ['id', 'username', 'rol']
            }]
        });

        return res.status(200).json({
            status: 'success',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener la lista de personal:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor.'
        });
    }
};


const deleteStaff = async (req, res) => {
  const { id } = req.params; // ID del miembro del personal (Staff)

  try {
    // 1. Verificar si el miembro del personal existe
    const staffMember = await Staff.findByPk(id);
    if (!staffMember) {
      return res.status(404).json({ 
        status: 'error',
        message: 'El miembro del personal especificado no existe en el sistema.' 
      });
    }

    // 2. 🚨 CONTROL DE BORRADO ESTRICTO: Validar si tiene carga académica asociada
    // Asumiendo que la clave foránea en AcademicLoad se llama 'staff_id' o 'docente_id' (ajústala si es necesario)
    const hasAcademicLoad = await AcademicLoad.findOne({
      where: { staff_id: id } 
    });

    if (hasAcademicLoad) {
      return res.status(400).json({
        status: 'error',
        message: 'este Docente pesee materias asiganadas.'
      });
    }

    // 3. Verificamos si tiene una cuenta de usuario vinculada para limpiarla
    const userAccount = await User.findOne({
      where: { staff_id: id } // O el campo de relación invertida según tus modelos
    });

    // 4. Ejecutar el borrado definitivo de forma segura
    if (userAccount) {
      // Si tiene cuenta de acceso a SAGES, la removemos primero
      await userAccount.destroy();
    }

    // Borrado físico del registro en la tabla Staff
    await staffMember.destroy();

    return res.status(200).json({
      status: 'success',
      message: `El registro de ${staffMember.nombre} ${staffMember.apellido} y sus accesos fueron removidos del sistema SAGES con éxito.`
    });

  } catch (error) {
    console.error('Error en deleteStaff:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Error interno del servidor al intentar remover el registro de personal.' 
    });
  }
};

module.exports = {
    createStaff,
    getAllStaff,
    updateStaff,
    getStaffList,
    deleteStaff
};