
module.exports = (sequelize, DataTypes) => {
    const companyAdmins = sequelize.define("company_admins", {
      companyId: {
         type : DataTypes.STRING ,
         allowNull : false
      } ,
      userId: {
        type: DataTypes.STRING,
        allowNull : true
      },
      status : {
        type : DataTypes.INTEGER ,
        defaultValue : 1
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
   

    companyAdmins.associate = function (models) {
        companyAdmins.belongsTo(models.companies, {
            foreignKey: 'companyId',
            as: "companiesDetails"
        }); 

        companyAdmins.belongsTo(models.users, {
          foreignKey: 'userId',
          as: "userDetails"
      }); 
    }


  
    return companyAdmins;
  };
  