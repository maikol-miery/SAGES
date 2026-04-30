const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.registerAdmin = async (req, res) => {
    try {
        const { nombre, apellido, email, username, password } = req.body;

        // Verificamos si ya existe el usuario
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ msg: 'El correo ya está registrado.' });
        }

        // Creamos el nuevo administrador
        const newAdmin = await User.create({
            nombre,
            apellido,
            email,
            username,
            password,
            rol: 'admin' // Forzamos que sea admin por ser la ruta de setup
        });

        res.status(201).json({
            msg: 'Administrador creado con éxito',
            user: {
                id: newAdmin.id,
                username: newAdmin.username,
                rol: newAdmin.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar el administrador');
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Buscar al usuario por username o email
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // 2. Verificar la contraseña usando el método que creamos en el modelo
        const isMatch = await user.validPassword(password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Contraseña incorrecta' });
        }

        // 3. Crear el token JWT
        const payload = {
            id: user.id,
            rol: user.rol
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '8h' // El token durará toda una jornada laboral
        });

        res.json({
            msg: 'Login exitoso',
            token,
            user: {
                nombre: user.nombre,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};