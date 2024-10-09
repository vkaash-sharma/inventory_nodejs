module.exports = (sequelize, DataTypes) => {
    const MeetingsDocument = sequelize.define("meeting_documents", {
        meeting_id: {
        type: DataTypes.INTEGER,
      },
      document_type: {
        type: DataTypes.STRING,
      },
      document_url: {
        type: DataTypes.STRING,
      },
      instruction : {
        type : DataTypes.TEXT
      } ,
      process_status: {
        type: DataTypes.INTEGER,
      },
      video_translate: {
        type : DataTypes.TEXT
      },
      chatgpt_summary : {
        type : DataTypes.TEXT
      } ,
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
  
    MeetingsDocument.associate = function (models) {
        MeetingsDocument.belongsTo(models.meetings, {
            foreignKey: "meeting_id",
            as: "meetingsDetails",
          });

          MeetingsDocument.hasMany(models.meeting_documents_facts, {
            foreignKey: "meeting_document_id",
            as: "meetingsDocumentFactsDetail",
          });
      };
  
    return MeetingsDocument;
  };
  