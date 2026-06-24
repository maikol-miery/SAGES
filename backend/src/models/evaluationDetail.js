const { DataTypes } = require('sequelize');
const sequelize = require('../databases/db_config');

const EvaluationDetail = sequelize.define('EvaluationDetail', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    numero_evaluacion: {
        type: DataTypes.INTEGER, // Almacena si es la evaluación 1, 2, 3, 4 o 5
        allowNull: false
    },
    nota: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false
    }
}, {
    tableName: 'detalles_evaluaciones',
    timestamps: true,
    underscored: true // Controles en snake_case automáticos por Sequelize
});

module.exports = EvaluationDetail;