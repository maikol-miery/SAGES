const { DataTypes } = require('sequelize');
const sequelize = require('../databases/db_config');

const Registration = sequelize.define('Registration', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    tipo_inscripcion: {
        type: DataTypes.ENUM('nuevo_ingreso', 'regular'),
        allowNull: false
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Llaves foráneas explícitas
    StudentId: {
        type: DataTypes.UUID,
        references: { model: 'estudiantes', key: 'id' }
    },
    SectionId: {
        type: DataTypes.UUID,
        references: { model: 'secciones', key: 'id' }
    }
}, {
    tableName: 'inscripciones',
    timestamps: true, // Esto genera automáticamente la fecha de inscripción
    indexes: [
        {
            // Regla de oro: Un alumno no puede estar dos veces en la misma sección
            unique: true,
            fields: ['StudentId', 'SectionId']
        }
    ]
});

module.exports = Registration;