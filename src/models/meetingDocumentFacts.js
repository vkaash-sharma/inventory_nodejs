module.exports = (sequelize, DataTypes) => {
    const MeetingsDocumentFacts = sequelize.define("meeting_documents_facts", {
     meeting_document_id: {
        type: DataTypes.INTEGER,
      },
      fact_name: {
        type: DataTypes.TEXT,
      },
      fact_value_ai: {
        type: DataTypes.TEXT,
      },
      fact_value_manual : {
        type :DataTypes.TEXT
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
  
    MeetingsDocumentFacts.associate = function (models) {
        MeetingsDocumentFacts.belongsTo(models.meeting_documents, {
            foreignKey: "meeting_document_id",
            as: "meetingDocsDetail",
          });
      };
  
    return MeetingsDocumentFacts;
  };
  