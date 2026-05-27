const { DataTypes } = require('sequelize');
const sequelize = require('../databases/db_config');

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cedula: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY, // Solo fecha, sin hora
        allowNull: false
    },
    genero: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'activo'
    },
}, {
    tableName: 'estudiantes',
    timestamps: true,
    underscored: true
});

module.exports = Student;