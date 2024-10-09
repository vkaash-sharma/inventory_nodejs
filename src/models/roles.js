module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define("roles", { 
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
      deleted: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    });
  
    Role.associate = function (models) {
      Role.hasMany(models.user_roles, {
        foreignKey: 'roleId',
        as: "userRole"
      });
    };

  
    return Role;
  };
  