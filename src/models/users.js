const phoneValidationRegex = /\d{3}-\d{3}-\d{4}/;
const model = require("./index");
const bcryptjs = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("users", {
    firstName: {
       type : DataTypes.STRING ,
       allowNull : true
    } ,
    lastName: {
      type : DataTypes.STRING ,
      allowNull : true
   } ,
    email: {
      type: DataTypes.STRING,
      allowNull : false
    },
    mobile: {
      type: DataTypes.STRING,
    },
    password : {
      type : DataTypes.STRING
    } ,
    isInvited : {
      type : DataTypes.INTEGER
    } ,
    invitedBy: {
      type: DataTypes.INTEGER,
    },
    
    isRegistrationCompleted: {
      type: DataTypes.INTEGER,
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
    },
    isActive: {
      type: DataTypes.INTEGER,

    },
    createdBy : {
      type : DataTypes.INTEGER
    } ,
    updatedBy : {
      type : DataTypes.INTEGER
    },

    deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },

  });


  User.associate = function (models) {
    User.hasOne(models.user_roles, {
      foreignKey: "userId",
      as: "userRole",
    });

    User.hasOne(models.company_admins, {
      foreignKey: "userId",
      as: "companyAdminsData",
    });

    User.hasMany(models.meeting_participants, {
      foreignKey: "userId",
      as: "meetingUsersDetails",
    });
    User.hasMany(models.user_companies_access_temps , {
      foreignKey : "userId" ,
      as : "UserCompanyAccess"
    })

   
  };

  // to delete user some key from return model
  User.prototype.toJSON = function () {
    let values = Object.assign({}, this.get());
    delete values.password
    return values;
  };

  return User;
};
