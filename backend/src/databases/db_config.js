const { Sequelize } = require('sequelize');
require('dotenv').config(); 

// Creamos la instancia de Sequelize usando la URL de tu .env
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, 
  define: {
    timestamps: true, // Agrega createdAt y updatedAt a todas las tablas por defecto
    underscored: true, // Usa nombres de columna como fecha_nacimiento en lugar de fechaNacimiento (estilo SQL)
  },
});

module.exports = sequelize;