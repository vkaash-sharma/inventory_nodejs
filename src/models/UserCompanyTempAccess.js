module.exports = (sequelize, DataTypes) => {
  const UserCompanyAccess = sequelize.define("user_companies_access_temps", {
    companyId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userRole: {
      type: DataTypes.STRING,
    },
    createdBy: {
      type: DataTypes.INTEGER,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
    },

    deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  });

  UserCompanyAccess.associate = function (models) {
    UserCompanyAccess.belongsTo(models.companies, {
      foreignKey: "companyId",
      as: "companyDetails",
    });
    UserCompanyAccess.belongsTo(models.users, {
      foreignKey: "userId",
      as: "userDetails",
    });
  };

  return UserCompanyAccess;
};
