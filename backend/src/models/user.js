const { DataTypes } = require('sequelize');
const sequelize = require('../databases/db_config');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
        type: DataTypes.ENUM('admin', 'secretaria', 'profesor'),
        defaultValue: 'secretaria'
    },
    preguntaSeguridad1: {
    type: DataTypes.STRING,
    allowNull: true 
    },
    respuestaSeguridad1: {
        type: DataTypes.STRING,
        allowNull: true
    },
    preguntaSeguridad2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    respuestaSeguridad2: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10); 
      user.password = await bcrypt.hash(user.password, salt);

      if (user.respuestaSeguridad1) {
          const resp1Normalizada = user.respuestaSeguridad1.toLowerCase().trim();
          user.respuestaSeguridad1 = await bcrypt.hash(resp1Normalizada, salt);
      }

      if (user.respuestaSeguridad2) {
          const resp2Normalizada = user.respuestaSeguridad2.toLowerCase().trim();
          user.respuestaSeguridad2 = await bcrypt.hash(resp2Normalizada, salt);
      }
    },
   
    beforeUpdate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, salt);
        }
        if (user.changed('respuestaSeguridad1')) {
            user.respuestaSeguridad1 = await bcrypt.hash(user.respuestaSeguridad1.toLowerCase().trim(), salt);
        }
        if (user.changed('respuestaSeguridad2')) {
            user.respuestaSeguridad2 = await bcrypt.hash(user.respuestaSeguridad2.toLowerCase().trim(), salt);
        }
    }
  }
});

User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;