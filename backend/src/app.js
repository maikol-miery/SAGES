const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const authRoutes = require('./routes/authRoutes');
const studentsRoutes = require('./routes/studentsRoutes');
const sectionsRoutes = require('./routes/sectionsRoutes');
const subjectsRoutes = require('./routes/subjectsRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const academicLoadRoutes = require('./routes/academicLoadRoutes');
const staffRoutes = require('./routes/staffRoutes');
const qualificationsRoutes = require('./routes/qualificationsRoutes');
const representativesRoutes = require('./routes/representativeRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes')
const sequelize = require('./databases/db_config');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Vital para leer los req.body
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ msg: "Formato JSON inválido" });
  }
  next();
});
app.use(fileUpload({
    createParentPath: true, // Crea automáticamente la carpeta /storage si no existe
    limits: { fileSize: 50 * 1024 * 1024 }, // Límite de 50MB por ejemplo
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/academic-load', academicLoadRoutes)
app.use('/api/staff', staffRoutes);
app.use('/api/qualifications', qualificationsRoutes);
app.use('/api/representatives', representativesRoutes);
app.use('/api/maintenance', maintenanceRoutes);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL exitosa para SAGES.');
        
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados correctamente.');

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar:', error);
    }
}

startServer();