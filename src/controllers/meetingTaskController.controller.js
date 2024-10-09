const { CREATED, UPDATE } = require("../config/action.config");
const CommonService = require("../services/CommonService");
const {
  saveTask,
  getAllTaskFn,
  saveTaskAndUpdateFn,
} = require("../services/meetingTaskService");

// GET ALL TASKS WITH THE MEETINF IDS ========>
exports.getAllTaskByMeetingId = async (req, res) => {
  try {
    let id = req.params.id;
    let options = {
      where: {
        meeting_id: id,
        deleted: 0,
      },
      include: [
        {
          association: "taskOwners",
          required: false,
          where: {
            deleted: 0,
          },
        },
      ],
    };

    let resp = await getAllTaskFn(options, [
      "createdAt",
      "updatedAt",
      "deleted",
    ]);

    if (resp) {
      return res.REST.SUCCESS(1, "Fetch Data SuccessFully", resp);
    } else {
      return res.REST.NOTFOUND(0, "No Task Found..");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

exports.addEditTask = async (req, res) => {
  try {
    const data = CommonService.trimBodyData(req.body);
    const userId = req.userId;
    let options = { id: req.userId };

    // create action logs for the meeting task ==========>
    options = await CommonService.actionLogs(
      "meetings",
      data[0].meeting_id,
      UPDATE,
      options,
      data[0].meeting_id,
      userId,
      req.connection.remoteAddress
    );
    for (const dataVal of data) {
      const response = await saveTaskAndUpdateFn(
        dataVal,
        userId,
        req.connection.remoteAddress ,
        options
      );
      if (!response?.status) {
        return res.send({
          status: response?.status,
          message: response?.message,
        });
      }
    }
    // If all tasks are processed successfully
    res.send({
      status: 1,
      message: "All tasks processed successfully.",
    });
  } catch (error) {
    console.error("Error in addEditTask:", error);
    await CommonService.filterError(error, req, res);
  }
};
