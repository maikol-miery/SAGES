const {DataTypes} = require("sequelize")
const sequelize = require('../databases/db_config');

const Representative = sequelize.define("Rpresentative", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cedula: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        validate: { isEmail: true }
    },
    parentesco: {
        type: DataTypes.STRING, // Padre, Madre, Tío, etc.
        allowNull: false
    }
}, {
    tableName: 'representantes',
    timestamps: true
});

module.exports = Representative;