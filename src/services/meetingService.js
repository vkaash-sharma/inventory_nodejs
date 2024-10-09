const models = require("../models/index");
const sequelize = require("sequelize");
const { isMp3OrMp4 } = require("./CommonService");
// <=============GET ALL MEETING FUNCTIONS=================>
exports.getAllMeetingFn = async (options, excludedItems) => {
  try {
    let response = await models.meetings.findAll({
      ...options,
      attribute: {
        exclude: excludedItems
          ? excludedItems
          : ["createdAt", "updatedAt", "deleted"],
      },
    });

    return response;
  } catch (error) {
    console.log("Error in get All Meetings : ", error);
  }
};
// <================SAVE MEETING================>
exports.saveMeeting = async (data) => {
  try {
    let response = await models.meetings.create({
      companyId: data.companyId,
      projectId: data.projectId,
      description: data.description,
      meetingTitle: data.meetingTitle,
      startTime: data.startTime,
      endTime: data.endTime,
      createdBy: data.createdBy,
    });

    return response;
  } catch (error) {
    console.log("Error in getting single user by email : ", error);
  }
};

// <==========MEETING FIND ONE FUNCTION=============>
exports.meetingsFindOneFn = async (options) => {
  try {
    let response = await models.meetings.findOne(options);
    return response;
  } catch (error) {
    console.log("Error in get meeting by companyId : ", error);
  }
};

exports.checkFileTypFn = (meetingDocuments) => {
  console.log("🚀 ~ meetingDocuments:", meetingDocuments);
  // Track whether any invalid documents are found
  const invalidDocuments = meetingDocuments.filter((doc) => {
    return doc?.deleted !== 1 && !isMp3OrMp4(doc.document_url);
  });

  if (invalidDocuments.length > 0) {
    // If there are invalid documents, return failure status and message
    return {
      status: 0,
      message: "Allowed mp3/mp4 Files Only",
    };
  }
  // If all documents are valid, return success status and message
  return {
    status: 1,
    message: "success",
  };
};

exports.getTheAccessedMeetings = async (options, userLevel, userId) => {
  try {
    let excludedItems = ["updatedAt", "deleted"];
    if (userLevel !== 0) {
      options.include.push({
        association: "meetingParticipantsDetails",
        where: {
          deleted: 0,
          userId: userId,
        },
      });
    }
    let resp = await this.getAllMeetingFn(options, excludedItems);
    return resp;
  } catch (error) {
    console.log("Error in get meeting by companyId : ", error);
  }
};
