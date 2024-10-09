
module.exports = (sequelize, DataTypes) => {
    const Projects = sequelize.define("projects", {
      projectName: {
         type : DataTypes.STRING ,
         allowNull : false
      } ,
      companyId: {
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
  
    Projects.associate = function (models) {
      Projects.hasMany(models.meetings, {
          foreignKey: 'projectId',
          as: "projectMeetings"
      });

      Projects.belongsTo(models.companies, {
        foreignKey: 'companyId',
        as: "projectCompany"
    });
   
     
      
  }
  
    return Projects;
  };
  