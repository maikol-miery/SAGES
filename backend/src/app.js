const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
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

// Rutas
app.use('/api/auth', authRoutes);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL exitosa para SAGES.');
        
        await sequelize.sync({ force: false });
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