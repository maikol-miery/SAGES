const { DataTypes } = require('sequelize');
const sequelize = require('../databases/db_config');

const Qualification = sequelize.define('Qualification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nota: {
        type: DataTypes.DECIMAL(4, 2), 
        allowNull: false,
        validate: {
            min: 0,
            max: 20
        }
    },
    lapso: {
        type: DataTypes.ENUM('1', '2', '3'), // Los tres momentos del año escolar
        allowNull: false
    },
    tipo_evaluacion: {
        type: DataTypes.ENUM('continua', 'revisión', 'final'), 
        defaultValue: 'continua'
    },
    
}, {
    tableName: 'calificaciones',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            // CAMBIA ESTO: Usa los nombres con guion bajo
            fields: ['student_id', 'subject_id', 'lapso', 'section_id'] 
        }
    ]
});

module.exports = Qualification;
