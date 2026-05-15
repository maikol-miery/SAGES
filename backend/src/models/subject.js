const {DataTypes} = require("sequelize")
const sequelize = require("../databases/db_config")

const Subject = sequelize.define("subject", {
   id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    abreviatura: {
        type: DataTypes.STRING, // Ej: "MAT", "EF", "QUI"
        allowNull: false
        // Quitamos el unique: true porque se repite en varios años
    },
    nombre: {
        type: DataTypes.STRING, // Ej: "Matemáticas", "Educación Física"
        allowNull: false
    },
    grado: {
        type: DataTypes.STRING, 
        allowNull: false
    }
}, {
    tableName: 'materias',
    timestamps: true
});

module.exports = Subject;