module.exports = (sequelize, DataTypes) => {
  const MeetingsPartcipants = sequelize.define("meeting_participants", {
    meetingId: {
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    user_name : {
      type: DataTypes.STRING,
    } ,
    user_email : {
      type: DataTypes.STRING,
    } ,
    roleInMeeting: {
      type: DataTypes.STRING,
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

    MeetingsPartcipants.associate = function (models) {
      MeetingsPartcipants.belongsTo(models.meetings, {
        foreignKey: "meetingId",
        as: "meetingDetails",
      });


      MeetingsPartcipants.belongsTo(models.users, {
        foreignKey: "userId",
        as: "usersDetails",
      });
    };

  return MeetingsPartcipants;
};
