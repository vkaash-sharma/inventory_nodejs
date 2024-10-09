module.exports = (sequelize, DataTypes) => {
  const Meetings = sequelize.define("meetings", {
    assistant_id : {
      type : DataTypes.STRING ,
    },
    thread_id : {
      type : DataTypes.STRING ,
    } ,
    run_id : {
      type : DataTypes.STRING ,
    } ,
    run_status : {
      type : DataTypes.STRING ,
    } ,
    run_tb_name : {
      type : DataTypes.STRING ,
    } ,
    run_tb_id : {
      type: DataTypes.INTEGER,
    },
    companyId: {
      type: DataTypes.INTEGER,
    },
    projectId: {
      type: DataTypes.INTEGER,
    },
    meetingTitle: {
      type: DataTypes.STRING,
    },
    description : {
      type : DataTypes.TEXT
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull : true
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull : true
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

  Meetings.associate = function (models) {
    Meetings.belongsTo(models.projects, {
      foreignKey: "projectId",
      as: "projectDetails",
    });


    Meetings.belongsTo(models.companies, {
      foreignKey: "companyId",
      as: "companyDetails",
    });

    Meetings.hasMany(models.meeting_participants, {
      foreignKey: "meetingId",
      as: "meetingParticipantsDetails",
    });

    Meetings.hasMany(models.meeting_documents, {
      foreignKey: "meeting_id",
      as: "meetingDocumentsDetails",
    });

   
  };

  return Meetings;
};
