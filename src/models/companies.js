module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define("companies", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
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

  Company.associate = function (models) {
    Company.hasMany(models.company_admins, {
      foreignKey: "companyId",
      as: "companiesAdmins",
    });

    Company.hasMany(models.meetings, {
      foreignKey: "companyId",
      as: "companyMeetings",
    });
    Company.hasMany(models.projects, {
      foreignKey: "companyId",
      as: "companyProject",
    });
    Company.hasMany(models.user_companies_access_temps, {
      foreignKey: "companyId",
      as: "UsercompanyAccess",
    });
  };

  return Company;
};
