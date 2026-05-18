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
        type: DataTypes.STRING, // Los tres momentos del año escolar
        allowNull: false
    },
    tipo_evaluacion: {
        type: DataTypes.STRING, 
        defaultValue: 'continua'
    },
    
}, {
    tableName: 'calificaciones',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'academic_load_id', 'lapso']
        }
    ]
});

module.exports = Qualification;
