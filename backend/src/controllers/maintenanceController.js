// backend/src/controllers/maintenanceController.js

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

const PG_DUMP_PATH = "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe";
const PG_RESTORE_PATH = "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_restore.exe";

let dbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    name: 'sages_db',
    password: ''
};

if (process.env.DATABASE_URL) {
    try {
        const dbUrl = new URL(process.env.DATABASE_URL);

        dbConfig.user = dbUrl.username;
        dbConfig.password = decodeURIComponent(dbUrl.password);
        dbConfig.host = dbUrl.hostname;
        dbConfig.port = dbUrl.port || 5432;
        dbConfig.name = dbUrl.pathname.replace('/', '');

    } catch (error) {
        console.error('Error al leer DATABASE_URL:', error.message);
    }
}

/* ===========================================================
   EXPORTAR BACKUP
=========================================================== */

const exportDatabase = async (req, res) => {

    try {

        if (req.user.rol !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Acceso denegado.'
            });
        }

        const fecha = new Date().toISOString().split('T')[0];
        const fileName = `sages_db_${fecha}.bak`;

        const env = {
            ...process.env,
            PGPASSWORD: dbConfig.password
        };

        const args = [
            '-h', dbConfig.host,
            '-p', dbConfig.port,
            '-U', dbConfig.user,
            '-F', 'c',
            '-v',
            dbConfig.name
        ];

        console.log("========== PG_DUMP ==========");
        console.log(PG_DUMP_PATH);
        console.log(args.join(" "));

        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${fileName}`
        );

        res.setHeader(
            'Content-Type',
            'application/octet-stream'
        );

        const processDump = execFile(
            PG_DUMP_PATH,
            args,
            { env }
        );

        processDump.stdout.pipe(res);

        let errorLog = '';

        processDump.stderr.on('data', chunk => {
            errorLog += chunk.toString();
        });

        processDump.on('close', code => {

            console.log("========== PG_DUMP STDERR ==========");
            console.log(errorLog);

            console.log("Código:", code);

            if (code !== 0) {
                console.error("Error durante pg_dump");
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: 'error',
            message: error.message
        });

    }

};


/* ===========================================================
   RESTAURAR BACKUP
=========================================================== */

const restoreDatabase = async (req, res) => {
    try {

        if (req.user.rol !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Acceso denegado.'
            });
        }

        if (!req.files || !req.files.backupFile) {
            return res.status(400).json({
                status: 'error',
                message: 'Debe seleccionar un archivo .bak'
            });
        }

        const backupFile = req.files.backupFile;

        const uploadPath = path.join(
            __dirname,
            '../storage/temp_restore.bak'
        );

        if (!fs.existsSync(path.dirname(uploadPath))) {
            fs.mkdirSync(path.dirname(uploadPath), {
                recursive: true
            });
        }

        await backupFile.mv(uploadPath);

        console.log("\n==============================");
        console.log("INICIANDO RESTORE");
        console.log("==============================");

        console.log("Existe:", fs.existsSync(uploadPath));

        console.log("Tamaño:", fs.statSync(uploadPath).size);

        // LEER LOS PRIMEROS BYTES DEL ARCHIVO
        const fd = fs.openSync(uploadPath, 'r');
        const buffer = Buffer.alloc(10);

        fs.readSync(fd, buffer, 0, 10, 0);
        fs.closeSync(fd);

        console.log("Cabecera HEX:", buffer);
        console.log("Cabecera TEXTO:", buffer.toString());

        const env = {
            ...process.env,
            PGPASSWORD: dbConfig.password
        };

        const args = [
            '-l',
            uploadPath
        ];

        console.log("\n========== COMANDO ==========");
        console.log(PG_RESTORE_PATH);
        console.log(args.join(" "));

        execFile(
            PG_RESTORE_PATH,
            args,
            { env },

            (error, stdout, stderr) => {

                console.log("\n========== STDOUT ==========");
                console.log(stdout);

                console.log("\n========== STDERR ==========");
                console.log(stderr);

                console.log("\n========== ERROR ==========");
                console.log(error);

                // NO BORRAR EL ARCHIVO TODAVÍA

                if (error) {

                    return res.status(500).json({
                        status: 'error',
                        message: 'Falló pg_restore',
                        stderr,
                        stdout,
                        error: error.message
                    });

                }

                return res.status(200).json({
                    status: 'success',
                    message: 'El archivo .bak es válido.'
                });

            }

        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            status: 'error',
            message: error.message
        });

    }
};

module.exports = {
    exportDatabase,
    restoreDatabase
};