const { UPDATE, CREATED } = require("../config/action.config");
const models = require("../models/index");
const { compareArrays, actionLogs } = require("./CommonService");
const { meetingsFindOneFn } = require("./meetingService");
const { getSingleUserByEmail, saveNewUser, saveUserRole } = require("./UserServices");

// <======check if the user is a meeting participant or not =======>
exports.isMeetingParticipant = async (options) => {
  try {
    let resp = await models.meeting_participants.findAll(options);
    return resp;
  } catch (error) {
    console.log("error in isMeetingParticpants:::::", error);
  }
};

// findOne participant By ID
exports.getSingleParticipant = async (options) => {
  try {
    let resp = await models.meeting_participants.findOne(options);
    return resp;
  } catch (error) {
    console.log("error in isMeetingParticpants:::::", error);
  }
};

// <================SAVE MEETING PARTICIPANTS=================>
exports.saveMeetingParticipants = async (data) => {
  const { meeting_participants = [], meetingId, requestedUserId } = data;
  // Initialize an array to store the results
  const participants = [];
  try {
    // Use Promise.all to handle concurrent user lookups and creation
    await Promise.all(
      meeting_participants.map(async (participant) => {
        const { user_name, user_email, roleInMeeting } = participant;
        const obj = {
          user_name: "",
          user_email: "",
          userId: "",
          roleInMeeting,
          status: 1,
          meetingId,
          createdBy: requestedUserId,
        };

        // Check if the user exists
        const resp = await getSingleUserByEmail(user_email);
        if (resp) {
          const { firstName, lastName, id, email: userEmail } = resp.dataValues;
          obj.user_name = firstName + (lastName ? ` ${lastName}` : "");
          obj.user_email = userEmail;
          obj.userId = id;
        } else if (user_name && user_email) {
          // If the user does not exist and both name and email are provided
          const userObj = {
            firstName: user_name,
            email : user_email,
            hashedPassword:
              "$2a$12$kFNkXVBZM8YHsvXr9W88tumB9lclUiiAn.5bFbfaWRHOlSWm01GPm",
            mobile: null,
            createdBy: requestedUserId,
            isActive: 1,
          };
          const userResp = await saveNewUser(userObj);
          // <======assign the role as a new user========>
          let dataUserRole = {
            userId: userResp.id,
            roleId: 2,
          };
          let userRoleRes = await saveUserRole(dataUserRole);
          obj.userId = userResp.id;
          obj.user_email = userResp.email;
          obj.user_name = userResp.firstName;
        } else {
          obj.userId = null;
          obj.user_name = user_name;
        }

        participants.push(obj); // Add the participant object to the results array
      })
    );
    
    for (let i = 0; i < participants.length; i++) {
      let finalResp = await models.meeting_participants.create(participants[i]);
    }

    return participants;
  } catch (error) {
    console.error("Error in saveMeetingParticipants: ", error);
  }
};

// UPDATE THE MEETING PARTICIPANTS==========>

// <===============EDIT MEETING PARTICIPANTS================>
exports.editMeetingPartcipants = async (options, updationValue) => {
  try {
    // <=============remove the previous entries and add new ones====>
    await models.meeting_participants.update(
      { deleted: 1 },
      { where: { meetingId: +options.where.id } }
    );

    const meetingParticipantsRecords = updationValue.meeting_participants.map(
      (item) => ({
        meetingId: updationValue.meetingId,
        userId: item.userId,
        roleInMeeting: item.roleInMeeting,
        status: 1,
        updatedBy: updationValue.updatedBy,
      })
    );

    // Use bulkCreate to insert multiple records at once
    const meetingParticipants = await models.meeting_participants.bulkCreate(
      meetingParticipantsRecords,
      { raw: true }
    );

    return meetingParticipants;
  } catch (error) {
    console.log("Error in get meeting by companyId : ", error);
  }
};

// meeting by ids===>
exports.getParticipantsFn = async (options, excludedItems) => {
  try {
    let res = await models.meeting_participants.findOne({
      ...options,
      attributes: {
        exclude: excludedItems || ["createdAt", "updatedAt"],
      },
    });
    return res;
  } catch (error) {
    console.log("Error in  isCompanyAdmins :::::", error);
  }
};

exports.getMeetingAndUpdateParticipantsFn = async (
  id,
  requestedIds,
  userId,
  ipAddress,
  data,
  actionLogOption
) => {
  try {
    const baseOptions = {
      where: {
        id: id,
        deleted: 0,
      },
      include: [
        {
          association: "meetingParticipantsDetails",
          required: true,
          where: {
            deleted: 0,
          },
        },
      ],
    };

    let resp = await meetingsFindOneFn(baseOptions);
    let expectedIds = resp?.dataValues?.meetingParticipantsDetails.map(
      (item) => item.dataValues.id,
      data
    );
    let { commonValues, newValues, missingValues } = compareArrays(
      expectedIds,
      requestedIds
    );
    if (missingValues.length > 0) {
      for (let i = 0; i < missingValues.length; i++) {
        let participantId = missingValues[i];
        let whereOption = {
          where: {
            id: participantId,
            deleted: 0,
          },
        };

        let meetingRes = await this.getParticipantsFn(whereOption);
        meetingRes.update({ deleted: 1, updatedBy: userId }, actionLogOption);
      }
    }

    // <=================  check for those entries which are newly created =================>
    const newEntries = data?.meeting_participants?.filter(
      (participant) => !participant.hasOwnProperty("id")
    );
    if (newEntries) {
      let meetingParticipantsOptions = {
        meetingId: id,
        meeting_participants: newEntries,
        requestedUserId: userId,
      };
      let saveParticipants = await this.saveMeetingParticipants(
        meetingParticipantsOptions
      );
    }

    if (commonValues.length > 0) {
      for (let i = 0; i < commonValues.length; i++) {
        const filteredParticipants = data?.meeting_participants.filter(
          (participant) => participant.id === commonValues[i]
        );
        let whereCondition = {
          where: {
            id: filteredParticipants[0].id,
            deleted: 0,
          },
        };
        let response = await this.getParticipantsFn(whereCondition);
        await response.update(
          {
            roleInMeeting: filteredParticipants[0].roleInMeeting,
            user_name: filteredParticipants[0].user_name,
            user_email: filteredParticipants[0].user_email,
          },
          actionLogOption
        );
      }
    }
  } catch (error) {
    console.log("Error :::::::::::::::::::::::editMeetingPartcipantsFn", error);
  }
};
