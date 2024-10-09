module.exports = (sequelize, DataTypes) => {
    const MeetingsFAQs = sequelize.define("meeting_faqs", {
      meeting_id: {
        type: DataTypes.INTEGER,
      },
      question: {
        type: DataTypes.STRING,
      },
      answer_type: {
        type: DataTypes.TEXT,
      },
      answer_text : {
        type : DataTypes.TEXT
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

  
    // MeetingsFAQs.associate = function (models) {

    // };
  
    return MeetingsFAQs;
  };
  