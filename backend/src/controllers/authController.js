const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

// 1. Registrar el Administrador Inicial (Setup)
const registerAdmin = async (req, res) => {
    try {
        const { nombre, apellido, email, username, password } = req.body;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ status: 'error', message: 'El correo ya está registrado.' });
        }

        const newAdmin = await User.create({
            nombre,
            apellido,
            email,
            username,
            password,
            rol: 'admin' // Forzado por la ruta setup
        });

        return res.status(201).json({
            status: 'success',
            message: 'Administrador creado con éxito',
            data: {
                user: { id: newAdmin.id, username: newAdmin.username, rol: newAdmin.rol }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error al registrar el administrador.' });
    }
};

// 2. Iniciar Sesión (Login)
const login = async (req, res) => {
    try {
        const { username, password } = req.body; // 🎯 Cambiamos 'username' por 'username'

        // Buscamos al usuario si coincide con el username O con el email
        const user = await User.findOne({ 
            where: {
                [Op.or]: [
                    { username: username },
                    { email: username }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Error de autenticación',
                errors: [
                    { campo: 'username', mensaje: 'El nombre de usuario no está registrado.' }
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

        const payload = { id: user.id, rol: user.rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.json({
            status: 'success',
            message: 'Login exitoso',
            data: {
                token,
                user: { id: user.id, nombre: user.nombre, rol: user.rol }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error interno en el servidor.' });
    }
};

// 3. Registrar Personal (Nueva: Solo accesible por Admin)
const registerStaff = async (req, res) => {
    try {
        const { nombre, apellido, email, username, password, rol } = req.body;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ status: 'error', message: 'El correo ya está registrado.' });
        }

        const usernameExists = await User.findOne({ where: { username } });
        if (usernameExists) {
            return res.status(400).json({ status: 'error', message: 'El nombre de usuario ya está en uso.' });
        }

        const newStaff = await User.create({
            nombre,
            apellido,
            email,
            username,
            password,
            rol: rol || 'secretaria' // Si no viene rol, por defecto es secretaria
        });

        return res.status(201).json({
            status: 'success',
            message: `Usuario con rol de ${newStaff.rol} creado exitosamente.`,
            data: {
                user: { id: newStaff.id, username: newStaff.username, rol: newStaff.rol }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Error al registrar al miembro del personal.' });
    }
};

// 4. Cambiar Contraseña (Nueva: Para cualquier usuario logueado)
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // Inyectado por tu middleware authenticateToken

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        const isMatch = await user.validPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'La contraseña actual es incorrecta.' });
        }

        // El hook beforeUpdate del modelo se encarga de aplicar el hash automáticamente
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

const verifySecurityQuestions = async (req, res) => {
    try {
        const { username, answer1, answer2 } = req.body;

        // Buscar al usuario por su nombre de usuario
        const user = await User.findOne({ where: {
                [Op.or]: [
                    { username: username },
                    { email: username }
                ]
            }
        });
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        // Validar que el usuario tenga las preguntas y respuestas configuradas en la DB
        if (!user.preguntaSeguridad1 || !user.respuestaSeguridad1 || !user.respuestaSeguridad2) {
            return res.status(400).json({ status: 'error', message: 'El usuario no tiene preguntas configuradas.' });
        }

        // Comparar las respuestas limpiando espacios y pasando a minúsculas
        const match1 = await bcrypt.compare(answer1.toLowerCase().trim(), user.respuestaSeguridad1);
        const match2 = await bcrypt.compare(answer2.toLowerCase().trim(), user.respuestaSeguridad2);

        if (!match1 || !match2) {
            return res.status(401).json({ status: 'error', message: 'Las respuestas de seguridad son incorrectas.' });
        }

        // Generar el token temporal que expira en 5 minutos
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

// Paso 2: Validar el token temporal y cambiar la contraseña definitivamente
const resetPassword = async (req, res) => {
    try {
        const { temporaryToken, newPassword } = req.body;

        if (!temporaryToken) {
            return res.status(400).json({ status: 'error', message: 'Token de restablecimiento requerido.' });
        }

        // Verificar la validez y expiración del token temporal
        let decoded;
        try {
            decoded = jwt.verify(temporaryToken, process.env.JWT_SECRET);
        } catch (jwtError) {
            return res.status(401).json({ 
                status: 'error', 
                message: 'El enlace o sesión de recuperación expiró o es inválido. Intente de nuevo.' 
            });
        }

        // Buscar al usuario utilizando el ID almacenado en el token
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        // Actualizar la contraseña (el hook del modelo se encargará del hash)
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

const updateProfile = async (req, res) => {
    try {
        const { nombre, apellido, email, username, question1, answer1, question2, answer2 } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        // Si el frontend envía el campo, lo actualizamos; si no, se queda igual
        if (nombre) user.nombre = nombre;
        if (apellido) user.apellido = apellido;
        if (email) user.email = email;
        if (username) user.username = username;
        
        if (question1) user.preguntaSeguridad1 = question1;
        if (answer1) user.respuestaSeguridad1 = answer1; // El hook le aplicará el hash
        if (question2) user.preguntaSeguridad2 = question2;
        if (answer2) user.respuestaSeguridad2 = answer2; // El hook le aplicará el hash

        // PostgreSQL y Sequelize validarán automáticamente si el email o username ya existen
        await user.save();

        return res.status(200).json({
            status: 'success',
            message: 'Perfil actualizado correctamente.',
            user: {
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                username: user.username
            }
        });

    } catch (error) {
        console.error(error);
        
        // Manejo específico por si el nuevo username o email ya están en uso
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ 
                status: 'error', 
                message: 'El nombre de usuario o correo electrónico ya está en uso por otra persona.' 
            });
        }

        return res.status(500).json({ status: 'error', message: 'Error al actualizar el perfil.' });
    }
};

// 🎯 Exportación unificada en un solo objeto
module.exports = {
    registerAdmin,
    login,
    registerStaff,
    changePassword,
    verifySecurityQuestions,
    resetPassword,
    updateProfile
};