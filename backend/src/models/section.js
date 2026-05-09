const { DataTypes } = require('sequelize');
const sequelize = require('../databases/db_config');

const Section = sequelize.define('Section', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    grado: {
        type: DataTypes.ENUM('1', '2', '3', '4', '5'), 
        allowNull: false
    },
    seccion: {
        type: DataTypes.STRING(1), 
        allowNull: false
    },
    anio_escolar: {
        type: DataTypes.STRING, 
        allowNull: false
    },
}, {
    tableName: 'secciones',
    timestamps: true,

    indexes: [
        {
            unique: true,
            fields: ['grado', 'seccion', 'anio_escolar']
        }
    ]
});

module.exports = Section;