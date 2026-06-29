const { User, Staff, sequelize } = require('../models'); 
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

// 1. Registrar el Administrador Inicial (Setup)
const registerAdmin = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { nombre, apellido, email, username, password } = req.body;
        const staffExists = await Staff.findOne({ where: { email } });
        if (staffExists) {
            await t.rollback();
            return res.status(400).json({ status: 'error', message: 'El correo ya está registrado.' });
        }
        const userExists = await User.findOne({ where: { username } });
        if (userExists) {
            await t.rollback();
            return res.status(400).json({ status: 'error', message: 'El nombre de usuario ya está en uso.' });
        }
        const newStaffAdmin = await Staff.create({
            cedula: 'V-00000000', 
            nombre,
            apellido,
            email,
            tipo_personal: 'administrativo',
            estado: 'activo'
        }, { transaction: t });
        const newAdminUser = await User.create({
            username,
            password,
            rol: 'admin',
            staff_id: newStaffAdmin.id 
        }, { transaction: t });
        await t.commit();
        return res.status(201).json({
            status: 'success',
            message: 'Administrador creado con éxito',
            data: { user: { id: newAdminUser.id, username: newAdminUser.username, rol: newAdminUser.rol } }
        });
    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error al registrar el administrador.' });
    }
};

// 2. Iniciar Sesión (Login)
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ 
            where: {
                [Op.or]: [
                    { username: username },
                    { '$perfil.email$': username } 
                ]
            },
            include: [{ model: Staff, as: 'perfil' }]
        });
        if (!user) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Error de autenticación',
                errors: [ { campo: 'username', mensaje: 'El nombre de usuario o correo no está registrado.' } ]
            });
        }
        const isMatch = await user.validPassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'Error de autenticación',
                errors: [ { campo: 'password', mensaje: 'Contraseña incorrecta.' } ]
            });
        }
        const payload = { id: user.id, rol: user.rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.json({
            status: 'success',
            message: 'Login exitoso',
            data: {
                token,
                user: { 
                    id: user.id, 
                    nombre: user.perfil ? user.perfil.nombre : 'Usuario', 
                    apellido: user.perfil ? user.perfil.apellido : '',
                    rol: user.rol 
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
};

// 4. Cambiar Contraseña
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; 
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }
        const isMatch = await user.validPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'La contraseña actual es incorrecta.' });
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).json({ status: 'success', message: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error interno al intentar cambiar la contraseña.' });
    }
};

// 5. Verificar Preguntas de Seguridad
const verifySecurityQuestions = async (req, res) => {
    try {
        const { username, answer1, answer2 } = req.body;
        const user = await User.findOne({ 
            where: {
                [Op.or]: [ { username: username }, { '$perfil.email$': username } ],
                rol: 'admin' 
            },
            include: [{ model: Staff, as: 'perfil' }]
        });
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario administrador no encontrado.' });
        }
        if (!user.preguntaSeguridad1 || !user.respuestaSeguridad1 || !user.respuestaSeguridad2) {
            return res.status(400).json({ status: 'error', message: 'El administrador no tiene preguntas configuradas.' });
        }
        const match1 = await bcrypt.compare(answer1.toLowerCase().trim(), user.respuestaSeguridad1);
        const match2 = await bcrypt.compare(answer2.toLowerCase().trim(), user.respuestaSeguridad2);
        if (!match1 || !match2) {
            return res.status(401).json({ status: 'error', message: 'Las respuestas de seguridad son incorrectas.' });
        }
        const temporaryToken = jwt.sign(
            { id: user.id, username: user.username, resetPermitted: true },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        );
        return res.status(200).json({
            status: 'success',
            message: 'Respuestas verificadas correctamente.',
            temporaryToken
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
};

// 6. Restablecer Contraseña
const resetPassword = async (req, res) => {
    try {
        const { temporaryToken, newPassword } = req.body;
        if (!temporaryToken) {
            return res.status(400).json({ status: 'error', message: 'Token de restablecimiento requerido.' });
        }
        let decoded;
        try {
            decoded = jwt.verify(temporaryToken, process.env.JWT_SECRET);
        } catch (jwtError) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'El enlace o sesión de recuperación expiró o es inválido. Intente de nuevo.' 
            });
        }
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).json({ status: 'success', message: 'Contraseña restablecida con éxito. Ya puede iniciar sesión.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error al cambiar la contraseña.' });
    }
};

// 7. Actualizar Perfil Mixto
const updateProfile = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const userRolActual = req.user.rol; // 🌟 CAPTURAMOS EL ROL DEL MIDDLEWARE DE AUTH
        
        // 1. Desestructuración de propiedades mapeadas desde el schema de Zod
        const { 
            nombre, apellido, email, cedula, telefono, username, passwordActual, passwordNueva,
            question1, answer1, question2, answer2
        } = req.body;

        const user = await User.findByPk(userId, {
            include: [{ model: Staff, as: 'perfil' }]
        });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        // ✨ Validar si el username ya está en uso por otro usuario
        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ where: { username } });
            if (usernameExists) {
                await t.rollback();
                return res.status(400).json({ status: 'error', message: 'El nombre de usuario ya está en uso.' });
            }
            user.username = username;
        }

        if (passwordNueva && passwordNueva.trim() !== "") {
            if (!passwordActual) {
                await t.rollback();
                return res.status(400).json({ status: 'error', message: 'Debe proporcionar la contraseña actual para establecer una nueva.' });
            }

            const isMatch = await user.validPassword(passwordActual);
            if (!isMatch) {
                await t.rollback();
                return res.status(400).json({ status: 'error', message: 'La contraseña actual es incorrecta.' });
            }

            user.password = passwordNueva;
        }

        // 🛡️ Asignación directa en texto plano; los hooks 'beforeUpdate' del modelo se encargarán del hashing seguro
        if (question1 && answer1) {
            user.preguntaSeguridad1 = question1;
            user.respuestaSeguridad1 = answer1;
        }

        if (question2 && answer2) {
            user.preguntaSeguridad2 = question2;
            user.respuestaSeguridad2 = answer2;
        }

        if (user.perfil) {
            // 🚨 VALIDACIÓN DE CÉDULA ESTRICTA PARA EL ADMIN
            if (cedula && cedula !== user.perfil.cedula) {
                // 1. Bloqueo de seguridad por si un rol 'profesor' o 'secretaria' hackea el front
                if (userRolActual !== 'admin') {
                    await t.rollback();
                    return res.status(403).json({ 
                        status: 'error', 
                        message: 'No tienes permisos de administrador para modificar la cédula de identidad.' 
                    });
                }

                // 2. Verificar que la nueva cédula no la tenga otra persona
                const cedulaExists = await Staff.findOne({ where: { cedula } });
                if (cedulaExists) {
                    await t.rollback();
                    return res.status(400).json({ 
                        status: 'error', 
                        message: 'La cédula ingresada ya se encuentra registrada en el sistema SAGES.' 
                    });
                }

                // Si pasa los filtros, actualizamos la propiedad en memoria
                user.perfil.cedula = cedula;
            }

            user.perfil.nombre = nombre || user.perfil.nombre;
            user.perfil.apellido = apellido || user.perfil.apellido;
            user.perfil.email = email || user.perfil.email;
            if (telefono !== undefined) {
                user.perfil.telefono = telefono;
            }

            // 🌟 Agregamos la cédula a la query de actualización masiva
            await Staff.update({
                cedula: user.perfil.cedula,
                nombre: user.perfil.nombre,
                apellido: user.perfil.apellido,
                email: user.perfil.email,
                telefono: user.perfil.telefono
            }, {
                where: { id: user.perfil.id },
                transaction: t
            });
        }

        await user.save({ transaction: t });
        await t.commit();

        return res.status(200).json({
            status: 'success',
            message: 'Perfil actualizado correctamente.',
            data: {
                cedula: user.perfil ? user.perfil.cedula : '',
                nombre: user.perfil ? user.perfil.nombre : '',
                apellido: user.perfil ? user.perfil.apellido : '',
                email: user.perfil ? user.perfil.email : '',
                telefono: user.perfil ? user.perfil.telefono : '',
                username: user.username
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Error al actualizar el perfil en el backend:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                status: 'error', 
                message: 'El correo electrónico ya está en uso por otra persona.' 
            });
        }
        
        return res.status(500).json({ status: 'error', message: 'Error interno al actualizar el perfil.' });
    }
};

const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'rol', 'preguntaSeguridad1', 'preguntaSeguridad2'], 
            include: [{ model: Staff, as: 'perfil', attributes: ['cedula', 'nombre', 'apellido', 'email', 'telefono'] }]
        });
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }
        return res.status(200).json({
            status: 'success',
            data: {
                username: user.username,
                rol: user.rol,
                nombre: user.perfil ? user.perfil.nombre : '',
                apellido: user.perfil ? user.perfil.apellido : '',
                cedula: user.perfil ? user.perfil.cedula : '',
                email: user.perfil ? user.perfil.email : '',
                telefono: user.perfil ? user.perfil.telefono : '',
                question1: user.preguntaSeguridad1 || '',
                question2: user.preguntaSeguridad2 || ''
            }
        });
    } catch (error) {
        console.error('Error en getMe:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al obtener el perfil.' });
    }
};

// 🌟 8. NUEVO ENDPOINT: Obtener solo los enunciados de las preguntas del admin
const getSecurityQuestions = async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({
            where: {
                [Op.or]: [ { username: username }, { '$perfil.email$': username } ],
                rol: 'admin'
            },
            include: [{ model: Staff, as: 'perfil' }]
        });

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario administrador no encontrado o no registrado.' });
        }

        // Si las columnas en la BD están nulas, frena aquí
        if (!user.preguntaSeguridad1 || !user.preguntaSeguridad2) {
            return res.status(400).json({
                status: 'error',
                message: 'El administrador no posee preguntas de seguridad configuradas en su cuenta SAGES.'
            });
        }

        // Retorna SOLO los textos de las preguntas de forma segura
        return res.status(200).json({
            status: 'success',
            data: {
                question1: user.preguntaSeguridad1,
                question2: user.preguntaSeguridad2
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error interno al recuperar las credenciales de seguridad.' });
    }
};

module.exports = {
    registerAdmin,
    login,
    changePassword,
    verifySecurityQuestions,
    resetPassword,
    updateProfile,
    getMe,
    getSecurityQuestions // 👈 Exportación añadida
};