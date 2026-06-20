const { DataTypes } = require("sequelize")
const sequelize = require("../databases/db_config")

const Subject = sequelize.define("subject", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    abreviatura: {
        type: DataTypes.STRING, // Ej: "MAT", "EF", "QUI"
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING, // Ej: "Matemáticas", "Orientación y Convivencia"
        allowNull: false
    },
    grado: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    // 🌟 CAMBIO NUEVO: Control de escala para SAGES (0-20 o A-E)
    tipo_evaluacion: {
        type: DataTypes.ENUM('cuantitativa', 'cualitativa'),
        defaultValue: 'cuantitativa',
        allowNull: false
    }
}, {
    tableName: 'materias',
    timestamps: true,
    paranoid: true
});

module.exports = Subject;