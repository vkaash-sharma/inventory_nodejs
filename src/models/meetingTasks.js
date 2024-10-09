module.exports = (sequelize, DataTypes) => {
  const MeetingsTasks = sequelize.define("meeting_tasks", {
    meeting_id: {
      type: DataTypes.INTEGER,
    },
    meeting_description: {
      type: DataTypes.TEXT,
    },
    meetingDueDate: {
      type: DataTypes.DATE,
    },
    user_count: {
      type: DataTypes.INTEGER,
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

  MeetingsTasks.associate = function (models) {
    MeetingsTasks.hasMany(models.meeting_task_users, {
      foreignKey: "meeting_task_id",
      as: "taskOwners",
    });

   
  };

  return MeetingsTasks;
};
