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
    // Llaves foráneas
    StudentId: {
        type: DataTypes.UUID,
        references: { model: 'estudiantes', key: 'id' },
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
    tableName: 'calificaciones',
    timestamps: true,
    indexes: [
        {
            // Evita que un alumno tenga dos notas para la misma materia en el mismo lapso
            unique: true,
            fields: ['StudentId', 'SubjectId', 'lapso', 'SectionId']
        }
    ]
});

module.exports = Qualification;