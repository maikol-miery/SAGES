// backend/src/controllers/authController.js
const { User, Staff, sequelize } = require('../models'); // 🔄 Importación unificada
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

// 1. Registrar el Administrador Inicial (Setup)
const registerAdmin = async (req, res) => {
    const t = await sequelize.transaction(); // Transacción para operación multi-tabla
    try {
        const { nombre, apellido, email, username, password } = req.body;

        // Validar si el correo ya existe en la tabla Staff
        const staffExists = await Staff.findOne({ where: { email } });
        if (staffExists) {
            await t.rollback();
            return res.status(400).json({ status: 'error', message: 'El correo ya está registrado.' });
        }

        // Validar si el username ya existe en la tabla User
        const userExists = await User.findOne({ where: { username } });
        if (userExists) {
            await t.rollback();
            return res.status(400).json({ status: 'error', message: 'El nombre de usuario ya está en uso.' });
        }

        // A. Crear el perfil físico del Admin en Staff
        const newStaffAdmin = await Staff.create({
            cedula: 'V-00000000', // Cédula genérica por ser el setup inicial del sistema
            nombre,
            apellido,
            email,
            tipo_personal: 'administrativo',
            estado: 'activo'
        }, { transaction: t });

        // B. Crear la cuenta de acceso vinculada
        const newAdminUser = await User.create({
            username,
            password,
            rol: 'admin',
            staff_id: newStaffAdmin.id // Vinculación de la FK
        }, { transaction: t });

        await t.commit();

        return res.status(201).json({
            status: 'success',
            message: 'Administrador creado con éxito',
            data: {
                user: { id: newAdminUser.id, username: newAdminUser.username, rol: newAdminUser.rol }
            }
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

        // ✨ Buscamos en User, pero incluyendo Staff para evaluar el email mediante un LEFT JOIN
        const user = await User.findOne({ 
            where: {
                [Op.or]: [
                    { username: username },
                    { '$perfil.email$': username } // Busca en la columna email de la tabla Staff usando el alias 'perfil'
                ]
            },
            include: [{
                model: Staff,
                as: 'perfil' // Alias configurado en index.js
            }]
        });

        if (!user) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Error de autenticación',
                errors: [
                    { campo: 'username', mensaje: 'El nombre de usuario o correo no está registrado.' }
                ]
            });
        }

        // Verificar la contraseña usando el método del modelo
        const isMatch = await user.validPassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'Error de autenticación',
                errors: [
                    { campo: 'password', mensaje: 'Contraseña incorrecta.' }
                ]
            });
        }

        // Payload del JWT
        const payload = { id: user.id, rol: user.rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.json({
            status: 'success',
            message: 'Login exitoso',
            data: {
                token,
                // Extraemos nombre y apellido directamente desde el perfil físico anidado
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

// 4. Cambiar Contraseña (Sin cambios drásticos, solo interactúa con la tabla User)
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

        return res.status(200).json({
            status: 'success',
            message: 'Contraseña actualizada exitosamente.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error interno al intentar cambiar la contraseña.' });
    }
};

// 5. Verificar Preguntas de Seguridad (Búsqueda adaptada a la relación con Staff)
const verifySecurityQuestions = async (req, res) => {
    try {
        const { username, answer1, answer2 } = req.body;

        // Buscamos cruzando con staff, pero agregamos la condición obligatoria de que el rol sea 'admin'
        const user = await User.findOne({ 
            where: {
                [Op.or]: [
                    { username: username },
                    { '$perfil.email$': username }
                ],
                rol: 'admin' // 🔥 CANDADO: Solo los administradores tienen permitido este flujo
            },
            include: [{ model: Staff, as: 'perfil' }]
        });
        
        // Si no existe o no es admin, devolvemos un mensaje genérico por seguridad
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

// 6. Restablecer Contraseña (Lógica intacta sobre la tabla User)
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

        return res.status(200).json({
            status: 'success',
            message: 'Contraseña restablecida con éxito. Ya puede iniciar sesión.'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error al cambiar la contraseña.' });
    }
};

// 7. Actualizar Perfil Mixto (Modifica datos en ambas tablas de forma segura)
const updateProfile = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { nombre, apellido, email, username, question1, answer1, question2, answer2 } = req.body;

        const user = await User.findByPk(req.user.id, {
            include: [{ model: Staff, as: 'perfil' }]
        });
        
        if (!user) {
            await t.rollback();
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        // A. Actualizar campos demográficos en la tabla Staff
        if (user.perfil) {
            if (nombre) user.perfil.nombre = nombre;
            if (apellido) user.perfil.apellido = apellido;
            if (email) user.perfil.email = email;
            await user.perfil.save({ transaction: t });
        }

        // B. Actualizar campos propios de User
        if (username) user.username = username;
        
        // 🔥 CANDADO: Solo si el rol es 'admin' procesamos las preguntas de seguridad
        if (user.rol === 'admin') {
            if (question1) user.preguntaSeguridad1 = question1;
            if (answer1) user.respuestaSeguridad1 = answer1; 
            if (question2) user.preguntaSeguridad2 = question2;
            if (answer2) user.respuestaSeguridad2 = answer2; 
        }

        await user.save({ transaction: t });
        await t.commit();

        return res.status(200).json({
            status: 'success',
            message: 'Perfil actualizado correctamente.',
            user: {
                nombre: user.perfil ? user.perfil.nombre : '',
                apellido: user.perfil ? user.perfil.apellido : '',
                email: user.perfil ? user.perfil.email : '',
                username: user.username
            }
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                status: 'error', 
                message: 'El nombre de usuario o correo electrónico ya está en uso por otra persona.' 
            });
        }

        return res.status(500).json({ status: 'error', message: 'Error al actualizar el perfil.' });
    }
};

module.exports = {
    registerAdmin,
    login,
    changePassword,
    verifySecurityQuestions,
    resetPassword,
    updateProfile
};