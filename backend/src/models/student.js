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
        type: DataTypes.ENUM('M', 'F'),
        allowNull: false
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('activo', 'retirado', 'graduado'),
        defaultValue: 'activo'
    },
    RepresentativeId: {
        type: DataTypes.UUID,
        references: {
            model: 'representantes',
            key: 'id'
        }
    }
}, {
    tableName: 'estudiantes',
    timestamps: true
});

module.exports = Student;