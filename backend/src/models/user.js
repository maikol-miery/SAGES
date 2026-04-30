const { DataTypes } = require('sequelize');
const sequelize = require('../databases/db_config');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
        isEmail: true // Valida que el formato sea de correo electrónico
        }
    },
   username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('admin', 'personal'),
        defaultValue: 'personal'
    }
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10); 
      user.password = await bcrypt.hash(user.password, salt); 
    },
   
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;