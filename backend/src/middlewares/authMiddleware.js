const jwt = require('jsonwebtoken');

// Este es el middleware principal
const authenticateToken = (req, res, next) => {
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Si no hay token, rechazamos la entrada
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        // 3. Verificar si el token es válido y no ha expirado
        // Usamos la "Secret Key" que definiste en tus variables de entorno
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_sages');
        
        // 4. Guardar los datos del usuario verificado en el objeto req
        // Esto permite que el controlador sepa QUIÉN está haciendo la operación
        req.user = verified;

        // 5. ¡Pase adelante!
        next(); 
    } catch (error) {
        // Si el token es falso o expiró
        return res.status(403).json({ message: 'Token no válido o expirado.' });
    }
};

module.exports = authenticateToken;