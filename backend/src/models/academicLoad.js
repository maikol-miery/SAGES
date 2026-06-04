const { DataTypes } = require('sequelize');
const sequelize = require('../databases/db_config');

const AcademicLoad = sequelize.define('AcademicLoad', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    anio_escolar: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'activo' 
    }
}, {
    tableName: 'carga_academica',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            // Un profesor no puede tener asignada la misma materia en la misma sección dos veces
            unique: true,
            fields: ['staff_id', 'subject_id', 'section_id']
        }
    ]
});

module.exports = AcademicLoad;