const {DataTypes} = require("sequelize")
const sequelize = require("../databases/db_config")

const Staff = sequelize.define('Teacher', {
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
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    tipo_personal: {
        type: DataTypes.ENUM('docente', 'administrativo'),
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: "activo",
        allowNull: true
    }
}, {
    tableName: 'personal',
    timestamps: true
});

module.exports = Staff;