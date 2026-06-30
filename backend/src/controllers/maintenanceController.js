const { exec } = require('child_process');
const path = require('path');

// Cargamos las variables de entorno
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Solo necesitamos la ruta al exportador
const PG_DUMP_PATH = path.join(__dirname, '../bin/pg_dump.exe');

let dbConfig = { host: 'localhost', port: 5432, user: 'postgres', name: 'sages_db', password: '' };

// Verificamos si hay URL de conexión
if (process.env.DATABASE_URL) {
    try {
        const dbUrl = new URL(process.env.DATABASE_URL);
        dbConfig.user = dbUrl.username;
        dbConfig.password = decodeURIComponent(dbUrl.password);
        dbConfig.host = dbUrl.hostname;
        dbConfig.port = dbUrl.port || 5432;
        dbConfig.name = dbUrl.pathname.replace('/', '');
    } catch (error) {
        console.error('🔴 Error al parsear DATABASE_URL:', error.message);
    }
}

// ÚNICO MÉTODO: Exportar Respaldo
const exportDatabase = async (req, res) => {
    try {
        // Validamos que solo el admin pueda hacer el respaldo
        if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Acceso denegado.' });

        const fecha = new Date().toISOString().split('T')[0];
        // Utilizamos la extensión .backup para compatibilidad nativa con pgAdmin
        const fileName = `sages_db_${fecha}.backup`; 
        const env = { ...process.env, PGPASSWORD: dbConfig.password };
        
        // -F c genera el formato Custom que es el ideal para pgAdmin
        const comando = `"${PG_DUMP_PATH}" -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -F c ${dbConfig.name}`;

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/octet-stream');

        const processDump = exec(comando, { env });
        
        // Enviamos el archivo directamente al navegador del usuario
        processDump.stdout.pipe(res);

        processDump.on('close', (code) => {
            if (code !== 0) console.error(`🔴 Error en pg_dump código: ${code}`);
        });
    } catch (error) {
        console.error('🔴 Error interno al exportar:', error);
        res.status(500).send('Error interno del servidor.');
    }
};

// Exportamos únicamente la función de respaldo
module.exports = { exportDatabase };