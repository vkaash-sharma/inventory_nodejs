const { CREATED, UPDATE } = require("../config/action.config");
const CommonService = require("../services/CommonService");
const { truncateAndCopyData } = require("../services/companyService");
const {
  saveMeetingDocs,
  updateMeetingDocuments,
} = require("../services/meetingDocuments");
const {
  saveMeetingParticipants,
  isMeetingParticipant,
  getMeetingAndUpdateParticipantsFn,
} = require("../services/meetingParticipants");
const {
  getAllMeetingFn,
  saveMeeting,
  meetingsFindOneFn,
  checkFileTypFn,
  getTheAccessedMeetings,
} = require("../services/meetingService");
const sequelize = require("sequelize");
const {
  meetingAccessLevelFn,
  companyAccessLevelFn,
} = require("../services/userAccessService");
const { allCompanyAdminsFn } = require("../services/companyAdminService");

// Fetch All Meetings Data from this apis====>
exports.getAllMeetings = async (req, res) => {
  try {
    let options = {
      where: {
        deleted: 0,
      },
    };
    const response = await getAllMeetingFn(options, [
      "createdAt",
      "updatedAt",
      "deletedAt",
    ]);
    if (response) {
      return res.REST.SUCCESS(1, "Fetch Data SuccessFully", response);
    } else {
      return res.REST.NOTFOUND(0, "No Meetings Found..");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// get meeting by id====>
exports.getMeetingById = async (req, res) => {
  try {
    let id = req.params.id;
    let companyId = req.query.companyId;
    const userRoleLevel = CommonService.getUserRoleLevel(req.user);
    let userId = req.userId;
    let meetingAccessCheck = await meetingAccessLevelFn(
      "read",
      companyId,
      id,
      userId,
      userRoleLevel?.level
    );
    if (!meetingAccessCheck.status) {
      return res.send({
        status: 0,
        message: meetingAccessCheck.message,
      });
    }
    const options = {
      where: {
        id: id,
        deleted: 0,
      },
      include: [
        {
          association: "projectDetails",
          attributes: ["id", "projectName"],
          required: false,
          where: {
            deleted: 0,
          },
        },
        {
          association: "companyDetails",
          attributes: ["id", "name", "shortName", "logo"],
          required: false,
          where: {
            deleted: 0,
          },
        },
        {
          association: "meetingParticipantsDetails",
          attributes: [
            "id",
            "userId",
            "user_name",
            "user_email",
            "roleInMeeting",
            "status",
          ],
          required: false,
          where: {
            deleted: 0,
          },
          include: [
            {
              association: "usersDetails",
              attributes: ["id", "firstName", "lastName", "email"],
              required: false,
              where: {
                deleted: 0,
              },
            },
          ],
        },
        {
          association: "meetingDocumentsDetails",
          where: {
            deleted: 0,
          },
          include: [
            {
              association: "meetingsDocumentFactsDetail",
              required: false,
              where: {
                deleted: 0,
              },
            },
          ],
          required: false,
          attributes: {
            exclude: ["createdBy", "updatedBy", "createdAt", "updatedAt"],
          },
        },
      ],
    };

    let response = await meetingsFindOneFn(options);

    if (response) {
      if (userRoleLevel?.level === 0) {
        return res.REST.SUCCESS(1, "Fetch Data SuccessFully", {
          ...response.dataValues,
          isSuperAdmin: 1,
        });
      }
      return res.REST.SUCCESS(1, "Fetch Data SuccessFully", response);
    } else {
      return res.REST.NOTFOUND(0, "No Meetings Found..");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};
// get meetings by companyIds ====>
exports.getMeetingBasedonCompanyId = async (req, res) => {
  try {
    const { companyId, projectId } = req.query;
    let userId = req.userId;
    const userRoleLevel = CommonService.getUserRoleLevel(req.user);

    let companyAccessCheckRes = await companyAccessLevelFn(
      companyId,
      userId,
      userRoleLevel?.level
    );
    if (!companyAccessCheckRes.status) {
      return res.send({
        status: 0,
        message: companyAccessCheckRes.message,
      });
    }
    const options = {
      where: {
        companyId,
        projectId,
        deleted: 0,
      },
      include: [
        {
          association: "meetingDocumentsDetails",
          required: false,
          where: {
            deleted: 0,
          },
        },
        {
          association: "meetingParticipantsDetails",
          required: false,
          where: {
            deleted: 0,
            userId: req.userId, //check for the future need to change when userId check
          },
        },
      ],
    };

    let response = await getAllMeetingFn(options);

    // Add super admin flag if applicable
    if (userRoleLevel?.level === 0 && Array.isArray(response)) {
      response = response.map((item) => ({
        ...item.dataValues,
        isSuperAdmin: 1,
      }));
    }

    if (response && response.length > 0) {
      return res.REST.SUCCESS(1, "Fetch Data Successfully", response);
    } else {
      return res.REST.NOTFOUND(0, "No Meetings Found.");
    }
  } catch (error) {
    console.error("Error in getMeetingBasedonCompanyId:", error);
    await CommonService.filterError(error, req, res);
  }
};

// create new meetings ====>
exports.createNewMeetings = async (req, res) => {
  try {
    let data = CommonService.trimBodyData(req.body);
    let userId = req.userId;
    const userRoleLevel = CommonService.getUserRoleLevel(req.user);
    let companyAccessCheckRes = await companyAccessLevelFn(
      data.companyId,
      userId,
      userRoleLevel?.level
    );
    if (!companyAccessCheckRes.status) {
      return res.send({
        status: 0,
        message: companyAccessCheckRes.message,
      });
    }

    data.createdBy = req.userId;
    let checkFileType = checkFileTypFn(data.meeting_documents);
    if (!checkFileType.status) {
      return res.send({
        status: checkFileType.status,
        message: checkFileType.message,
      });
    }
    const response = await saveMeeting(data);
    if (response) {
      let options = { userId: response?.id };
      options = await CommonService.actionLogs(
        "meetings",
        response?.id,
        CREATED,
        options,
        req?.userId,
        userId,
        req.connection.remoteAddress
      );

      //   create meeting participants =======>
      let meetingParticipantsOptions = {
        meetingId: response?.id,
        meeting_participants: data.meeting_participants,
        requestedUserId: req.userId,
      };
      let responseCreateMeetingParticipants = await saveMeetingParticipants(
        meetingParticipantsOptions
      );

      // <=======now create the meeting document============>
      let meetingDoumentOpt = {
        meeting_id: response?.id,
        meeting_documents: [...data.meeting_documents],
        createdBy: req.userId,
      };
      let meetingResp = await saveMeetingDocs(meetingDoumentOpt);

      // <=========TRUNCATE AND COMPY DATA IN THE ACCESS TABLE=====>
      truncateAndCopyData();

      return res.REST.SUCCESS(1, "Meeting Created Successfully", response);
    } else {
      return res.REST.ERROR(0, "Unable to create the meeting");
    }
  } catch (error) {
    console.log("Error in catch block:", error);
    await CommonService.filterError(error, req, res);
  }
};

// Edit Meetings ======>
exports.editNewMeetings = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.userId;
    let data = CommonService.trimBodyData(req.body);
    // <=============== check meeting user access check =============>
    const userRoleLevel = CommonService.getUserRoleLevel(req.user);
    let meetingAccessCheck = await meetingAccessLevelFn(
      "write",
      data.companyId,
      id,
      userId,
      userRoleLevel?.level
    );
    if (!meetingAccessCheck.status) {
      return res.send({
        status: 0,
        message: meetingAccessCheck.message,
      });
    }

    // <============ check wheather the document is mp3 and mp4 =======================>
    let checkFileType = checkFileTypFn(data.meeting_documents);
    if (!checkFileType.status) {
      return res.send({
        status: checkFileType.status,
        message: checkFileType.message,
      });
    }
    // ============>
    let options = {
      where: {
        id: id,
        deleted: 0,
      },
    };
    data.updatedBy = req.userId;
    let editRes = await meetingsFindOneFn(options);
    if (editRes) {
      let actionLogOption = {
        id: req?.userId,
      };
      actionLogOption = await CommonService.actionLogs(
        "meetings",
        editRes.id,
        UPDATE,
        actionLogOption,
        req?.userId,
        userId,
        req.connection.remoteAddress
      );
      await editRes.update(
        {
          companyId: data.companyId,
          projectId: data.projectId,
          description: data.description,
          meetingTitle: data.meetingTitle,
          startTime: data.startTime,
          endTime: data.endTime,
          updatedBy: data.updatedBy,
        },
        actionLogOption
      );

      //    // Edit Meeting Partcipants Upations =======>
      if (data.meeting_participants) {
        const requestedUserIds = data.meeting_participants
          .filter((participant) => participant.hasOwnProperty("id")) // Filter only those with 'id'
          .map((participant) => participant.id); // Extract the 'id' values
       
        let updateValue = {
          meetingId: id,
          meeting_participants: data.meeting_participants,
          roleInMeeting: data.roleInMeeting,
          updatedBy: req.userId,
        };
        await getMeetingAndUpdateParticipantsFn(
          id,
          requestedUserIds,
          userId,
          req.connection.remoteAddress,
          updateValue,
          actionLogOption
        );
      }

      // edit the meeting documents ======>
      if (data.meeting_documents) {
        let meetingDocsOpt = {
          meeting_id: id,
          meeting_documents: [...data.meeting_documents],
        };

        let meetingDocsRes = await updateMeetingDocuments(
          options,
          meetingDocsOpt,
          req.userId,
          actionLogOption
        );
      }

      // TRUNCATE AND COPY DATA IN THE ACCESS TABLE
      truncateAndCopyData();

      return res.REST.SUCCESS(1, "Meeting Updated Successfully", editRes);
    } else {
      return res.REST.NOTFOUND(0, "No Data Found.");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// delete Meetings =======>
exports.deleteMeetings = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.userId;
    let options = {
      where: {
        id: id,
        deleted: 0,
      },
    };
    let meetRes = await meetingsFindOneFn(options);
    if (meetRes) {
      let actionLogOption = {
        id: req?.userId,
      };
      await meetRes.update({ deleted: 1, updatedBy: req.userId });
      actionLogOption = await CommonService.actionLogs(
        "meetings",
        meetRes.id,
        UPDATE,
        actionLogOption,
        req?.userId,
        userId,
        req.connection.remoteAddress
      );
      return res.REST.SUCCESS(1, "Delete Meeting Successfully", { meetRes });
    } else {
      return res.REST.NOTFOUND(0, "No Data Found.");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// Suggested Users for the meeting===>
exports.suggestedUserInMeeting = async (req, res) => {
  try {
    let projectId = req.params.id;
    let companyId = req.query.companyId;

    let baseOptions = {
      where: {
        deleted: 0,
      },
      attributes: [
        "roleInMeeting",
        "id" ,
        [sequelize.col("meetingDetails.meetingTitle"), "meetingTitle"],
        [sequelize.col("usersDetails.id"), "userId"],
        [sequelize.col("usersDetails.firstName"), "userFirstName"],
        [sequelize.col("usersDetails.lastName"), "userLastName"],
        [sequelize.col("usersDetails.email"), "email"],
      ],
      include: [
        {
          association: "meetingDetails",
          attributes: [],
          where: {
            projectId: projectId,
            deleted: 0,
          },
        },
        {
          association: "usersDetails",
          attributes: [],
          where: {
            deleted: 0,
          },
        },
      ],
      group: ["usersDetails.id"], // add group by clause here
    };

    let resp = await isMeetingParticipant(baseOptions);

    if (resp && resp.length > 0) {
      return res.send({
        status: 1,
        message: "Data fetched successfully.",
        data: resp,
      });
    } else {
      // <================== when the company is newly created ============>
      let companyBaseOptions = {
        where: {
          companyId: companyId,
          deleted: 0,
        },
        attributes: [
          [sequelize.literal("'user'"), "roleInMeeting"], // Static value for roleInMeeting
          [sequelize.col("userDetails.id"), "userId"],
          [sequelize.col("userDetails.firstName"), "userFirstName"],
          [sequelize.col("userDetails.lastName"), "userLastName"],
          [sequelize.col("userDetails.email"), "email"],
        ],
        include: [
          {
            association: "userDetails",
            where: {
              deleted: 0,
            },
          },
        ],
      };
      let allAdmins = await allCompanyAdminsFn(companyBaseOptions);
      if (allAdmins) {
        return res.send({
          status: 1,
          message: "Data Fetch Successfully.",
          data: allAdmins,
        });
      } else {
        return res.send({
          status: 0,
          message: "No record found.",
          data: [],
        });
      }
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// get meetings based on company id for user meetings====>
exports.getUserMeetingBasedOnCompanyId = async (req, res) => {
  try {
    let id = req.params.id;
    const userRoleLevel = CommonService.getUserRoleLevel(req.user);
    let options = {
      where: {
        deleted: 0,
        companyId: +id,
      },
      attributes: [
        "id",
        "companyId",
        "projectId",
        "meetingTitle",
        "description",
        "startTime",
        "endTime",
        "createdBy",
        "createdAt",
      ],
      include: [
        {
          association: "companyDetails",
          attributes: ["id", "name", "shortName", "logo"],
          where: {
            deleted: 0,
          },
        },
        {
          association: "projectDetails",
          attributes: ["id", "projectName", "companyId", "status"],
          where: {
            deleted: 0,
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    };
    let response = await getTheAccessedMeetings(
      options,
      userRoleLevel.level,
      req.userId
    );
    if (response) {
      return res.send({
        status: 1,
        message: "Data Fetch Successfully.",
        data: response,
      });
    } else {
      return res.send({
        status: 0,
        message: "No Record Found.",
      });
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};
