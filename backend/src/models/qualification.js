const { DataTypes } = require('sequelize');
const sequelize = require('../databases/db_config');

const Qualification = sequelize.define('Qualification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    lapso: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    calificacion_final: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 0.00 // Promedio puro de las evaluaciones parciales (1 al 5)
    },
    puntos_ajuste: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    puntos_extracatedra: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    clausula_aplicada: {
        type: DataTypes.ENUM('ninguna', 'extracatedra', 'literal_9', 'literal_13'),
        allowNull: false,
        defaultValue: 'ninguna'
    },
    nota_definitiva: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0,
            max: 20
        }
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true // Justificación obligatoria para auditorías del plantel
    }
}, {
    tableName: 'calificaciones', // Mantenemos tu nombre original de tabla
    timestamps: true,
    underscored: true, // Crucial para mantener la consistencia de tus FKs en la BD
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'academic_load_id', 'lapso']
        }
    ]
});

module.exports = Qualification;