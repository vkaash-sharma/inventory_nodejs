module.exports = (sequelize, DataTypes) => {
  const MeetingsTasksUsers = sequelize.define("meeting_task_users", {
    meeting_task_id: {
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    participant_id : {
      type: DataTypes.INTEGER,
    } ,
    completed_date: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.INTEGER,
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


  MeetingsTasksUsers.associate = function (models) {
    MeetingsTasksUsers.belongsTo(models.meeting_tasks, {
      foreignKey: "meeting_task_id",
      as: "meetingTaskDetails",
    });
  };

  return MeetingsTasksUsers;
};
