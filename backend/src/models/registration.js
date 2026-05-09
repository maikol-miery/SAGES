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
    }
}, {
    tableName: 'inscripciones',
    timestamps: true,
    underscored: true,
   indexes: [
        {
        unique: true,
        // Usamos los nombres que Sequelize genera con underscored: true
        fields: ['student_id', 'section_id'] 
        }
    ]
});

module.exports = Registration;