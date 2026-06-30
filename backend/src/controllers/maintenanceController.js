const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Rutas a los ejecutables
const PG_DUMP_PATH = path.join(__dirname, '../bin/pg_dump.exe');
const PG_RESTORE_PATH = path.join(__dirname, '../bin/pg_restore.exe');

let dbConfig = { host: 'localhost', port: 5432, user: 'postgres', name: 'sages_db', password: '' };

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

// A. Exportar Respaldo
const exportDatabase = async (req, res) => {
    try {
        if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Acceso denegado.' });

        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `sages_db_${fecha}.bak`;
        const env = { ...process.env, PGPASSWORD: dbConfig.password };
        
        const comando = `"${PG_DUMP_PATH}" -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -F c ${dbConfig.name}`;

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/octet-stream');

        const processDump = exec(comando, { env });
        processDump.stdout.pipe(res);

        processDump.on('close', (code) => {
            if (code !== 0) console.error(`Error en pg_dump código: ${code}`);
        });
    } catch (error) {
        res.status(500).send('Error interno.');
    }
};

// B. Importar/Restaurar Respaldo (Técnica del .bat temporal)
const restoreDatabase = async (req, res) => {
    if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Acceso denegado.' });
    if (!req.files || !req.files.backupFile) return res.status(400).json({ message: 'Sin archivo.' });

    const backupFile = req.files.backupFile;
    const uploadPath = path.join(__dirname, '../storage/temp_restore.bak');
    const batPath = path.join(os.tmpdir(), `restore_${Date.now()}.bat`);

    try {
        if (!fs.existsSync(path.dirname(uploadPath))) fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
        await backupFile.mv(uploadPath);

        const comandoBat = [
            '@echo off',
            `"${PG_RESTORE_PATH}" -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.name} --clean --if-exists "${uploadPath}"`,
            'exit'
        ].join('\n');

        fs.writeFileSync(batPath, comandoBat);

        exec(`"${batPath}"`, { env: { ...process.env, PGPASSWORD: dbConfig.password } }, (error, stdout, stderr) => {
            // Limpieza inmediata
            if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
            if (fs.existsSync(batPath)) fs.unlinkSync(batPath);

            if (error && error.code !== 1) { // 1 es advertencia, aceptable
                console.error('🔴 Error crítico:', stderr);
                return res.status(500).json({ status: 'error', message: 'Fallo crítico en restauración' });
            }

            return res.status(200).json({ status: 'success', message: 'Restauración exitosa' });
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error en servidor' });
    }
};

module.exports = { exportDatabase, restoreDatabase };