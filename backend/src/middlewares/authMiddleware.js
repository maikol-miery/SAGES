const jwt = require('jsonwebtoken');

// 1. Tu middleware principal (Ajustado al estándar { status, message })
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'Acceso denegado. No se proporcionó un token.' 
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_sages');
        
        // ¡La magia que ya tenías hecha! Guarda el id y el rol
        req.user = verified;

        next(); 
    } catch (error) {
        return res.status(403).json({ 
            status: 'error', 
            message: 'Token no válido o expirado.' 
        });
    }
};

// 2. El validador de roles para rutas exclusivas de la directiva
const isAdmin = (req, res, next) => {
    // Verificamos si el usuario es administrador
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ 
            status: 'error', 
            message: 'Acceso denegado. Esta acción requiere privilegios de administrador.' 
        });
    }
    next();
};

// Exportamos ambos
module.exports = { 
    authenticateToken, 
    isAdmin 
};