const { DataTypes } = require('sequelize');
const sequelize = require('../databases/db_config');

const AcademicLoad = sequelize.define('AcademicLoad', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    // Llaves foráneas
    TeacherId: {
        type: DataTypes.UUID,
        references: { model: 'profesores', key: 'id' },
        allowNull: false
    },
    SubjectId: {
        type: DataTypes.UUID,
        references: { model: 'materias', key: 'id' },
        allowNull: false
    },
    SectionId: {
        type: DataTypes.UUID,
        references: { model: 'secciones', key: 'id' },
        allowNull: false
    }
}, {
    tableName: 'carga_academica',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            // Un profesor no puede tener asignada la misma materia en la misma sección dos veces
            unique: true,
            fields: ['teacher_id', 'subject_id', 'section_id']
        }
    ]
});

module.exports = AcademicLoad;