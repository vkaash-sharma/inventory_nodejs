const { CREATED, UPDATE } = require("../config/action.config");
const models = require("../models/index");
const { actionLogs, createChangeLogs } = require("./CommonService");
const {
  saveMeetingTaskUsers,
  updateTaskUserFn,
  saveMeetingTaskUsersSingle,
  getAllTaskUsers,
  getSingleTaskUsers,
} = require("./meetingTaskUserService");
const { Op, where } = require("sequelize");

// function to check the status value ====>
exports.checkStatus = (userCount, taskOwner) => {
  let closedCount = 0;

  taskOwner.forEach((item) => {
    if (item.status === "Closed") {
      closedCount++;
    }
  });

  return userCount === closedCount;
};
// <===========GET ALL TASK FUNCTION====================>
exports.getAllTaskFn = async (options, excludedItems) => {
  try {
    let response = await models.meeting_tasks.findAll({
      ...options,
      attributes: {
        exclude: excludedItems
          ? excludedItems
          : ["createdAt", "updatedAt", "deleted"],
      },
    });
    return response;
  } catch (error) {
    console.log("Error in get task by meeting : ", error);
  }
};

//

exports.getTaskById = async (options, excludedItems) => {
  try {
    let response = await models.meeting_tasks.findOne({
      ...options,
      attributes: {
        exclude: excludedItems
          ? excludedItems
          : ["createdAt", "updatedAt", "deleted"],
      },
    });
    return response;
  } catch (error) {
    console.log("Error in get task by meeting : ", error);
  }
};

// <==================SAVE TASK ============>
exports.saveTask = async (data) => {
  try {
    let resp = models.meeting_tasks.create({
      meeting_id: data.meeting_id,
      meeting_description: data.meeting_description,
      meetingDueDate: data.meetingDueDate,
      user_count: data.user_count,
      status: this.checkStatus(data.user_count, data.taskOwners)
        ? "Closed"
        : "Open",
      createdBy: data.createdBy,
    });

    return resp;
  } catch (error) {
    console.log("Error in get task by meeting : ", error);
  }
};

// UPDATE TASK SERVICE=====>
exports.updateTask = async (updatedValue, whereCondition) => {
  try {
    let resp = await models.meeting_tasks.update(updatedValue, whereCondition);
    return resp;
  } catch (error) {
    console.log("Error in Updated task service::::: ", error);
  }
};

// Utility function to compare arrays and get common, new, and missing values
function compareArrays(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  const commonValues = [...set1].filter((value) => set2.has(value));
  const newValues = [...set2].filter((value) => !set1.has(value));
  const missingValues = [...set1].filter((value) => !set2.has(value));

  return { commonValues, newValues, missingValues };
}

// Handle updates for task owners
exports.handleChildsEditFn = async (id, ownerObj, userId, options) => {
  try {
    const baseOptions = {
      where: { id, deleted: 0 },
      include: [
        { association: "taskOwners", required: false, where: { deleted: 0 } },
      ],
    };

    const resp = await this.getTaskById(baseOptions, [
      "createdAt",
      "updatedAt",
      "deleted",
    ]);
    // fetch the user existing ids and requesting its
    const existingIds =
      resp?.dataValues?.taskOwners.map((item) => item.participant_id) || [];
    const requestedIds = ownerObj?.map((i) => +i.participant_id) || [];
    // get the commonValues , newValues and the missingValues====>
    const { commonValues, newValues, missingValues } = compareArrays(
      existingIds,
      requestedIds
    );
    console.log("🚀 ~ exports.handleChildsEditFn= ~ commonValues, newValues, missingValues:", commonValues, newValues, missingValues)

    // Handle missing values
    if (missingValues?.length > 0) {
      for (let i = 0; i < missingValues.length; i++) {
        let baseOpt = {
          where: {
            participant_id: missingValues[i],
            meeting_task_id : id ,
            deleted: 0,
          },
        };
        let getTaskUser = await getSingleTaskUsers(baseOpt);
        await getTaskUser.update({ deleted: 1, updatedBy: userId }, options);
      }
    }
    // Handle common and new values
    const updatePromises = ownerObj.map(async (item) => {
      console.log("🚀 ~ updatePromises ~ item:", item)
      if (commonValues.includes(+item.participant_id)) {
        let baseOpt = {
          where: {
            meeting_task_id: id,
            participant_id: item.participant_id,
            deleted: 0,
          },
        };
        let getTaskUser = await getSingleTaskUsers(baseOpt);
        await getTaskUser.update(
          {
            status: item.status,
            completed_date: item.completed_date || null,
            updatedBy: userId,
          },
          options
        );
      } else if (newValues.includes(+item.participant_id)) {
        const data = {
          meeting_task_id: id,
          userId: item.userId,
          participant_id : item.participant_id ,
          status: item.status,
          completed_date: item.completed_date,
          createdBy: userId,
        };
        const response = await saveMeetingTaskUsersSingle(data);

        return response;
      }
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error in handleChildsEditFn:", error);
  }
};

// Save task and update associated records
exports.saveTaskAndUpdateFn = async (items, userId, ipAddress, options) => {
  try {
    // handle the case for the edit data ===>
    if (items.id) {
      const whereConditionTask = { where: { id: items.id, deleted: 0 } };
      const whereConditionTaskUser = {
        where: { meeting_task_id: items.id, deleted: 0 },
      };
      // when user deleted the particular task deleted the associated user===>
      if (items.deleted === 1) {
        let getTaskByIdResp = await this.getTaskById(whereConditionTask);
        await getTaskByIdResp.update(
          { deleted: 1, updatedBy: userId },
          options
        );


      // <================= handle all associated task users ==================> 
        let allTaskUserResp = await getAllTaskUsers(whereConditionTaskUser);
        let existingIds = [];
        if (allTaskUserResp?.length > 0) {
          for (let i = 0; i < allTaskUserResp.length; i++) {
            let singleId = allTaskUserResp[i]?.dataValues?.id;
            if (singleId) {
              existingIds.push(singleId);
            }
          }
        }
        if (existingIds.length > 0) {
          for (let i = 0; i < existingIds.length; i++) {
            let baseOpt = {
              where: {
                id: existingIds[i],
                deleted: 0,
              },
            };
            let resp = await getSingleTaskUsers(baseOpt);
            await resp.update({ deleted: 1, updatedBy: userId }, options);
          }
        }

        return { status: 1, message: "Deletion Successful." };
      } else {
        //  edit the data ==>
        // edit the task
        //<================= find the particular task ===========>
        let response = await this.getTaskById(whereConditionTask);
        response.update(
          {
            meeting_id: items.meeting_id,
            meeting_description: items.meeting_description,
            meetingDueDate: items.meetingDueDate,
            user_count: items.user_count,
            updatedBy: userId,
          },
          options
        );
        // UPDATE THE TASK USER 
        await Promise.all([
          // edit the its childs
          this.handleChildsEditFn(items.id, items.taskOwners, userId, options),
        ]);
        const statusCheckOptions = {
          where: { id: items.id, deleted: 0 },
          include: [
            {
              association: "taskOwners",
              required: false,
              where: { deleted: 0 },
            },
          ],
        };
        // fetch the task details ==> 
        const resp = await this.getAllTaskFn(statusCheckOptions, [
          "createdAt",
          "updatedAt",
          "deleted",
        ]);
        // check closed user count====>
        const closedTaskOwnerCount = resp.reduce((count, item) => {
          const taskOwners = item.dataValues?.taskOwners || [];
          return (
            count +
            taskOwners.filter((owner) => owner.status === "Closed").length
          );
        }, 0);
        // if equal then update the status to closed===>
        if (items.user_count === closedTaskOwnerCount) {
          let baseOpt ={ where: { id: items.id, deleted: 0 } }
          let taskUpdateStatus = await this.getTaskById(baseOpt);
          await taskUpdateStatus.update({ status: "Closed", updatedBy: userId } ,options)
        } else {
          // else mark as Open.
          let baseOpt ={ where: { id: items.id, deleted: 0 } }
          let taskUpdateStatus = await this.getTaskById(baseOpt);
          await taskUpdateStatus.update({ status: "Open", updatedBy: userId } ,options)
        }

        return { status: 1, message: "Task Updated Successfully." };
      }
    } else {
      // handle case for the create data ===>
      items.createdBy = userId;
      const response = await this.saveTask(items);
      if (response) {
        const baseOptions = {
          meeting_task_id: response.id,
          createdBy: userId,
          taskOwners: [...items.taskOwners],
        };
        const meetingTaskRes = await saveMeetingTaskUsers(baseOptions);
        return {
          status: 1,
          message: "Task Created Successfully.",
          data: response,
        };
      } else {
        return { status: 0, message: "Unable to create task.", data: [] };
      }
    }
  } catch (error) {
    console.error("Error in saveTaskAndUpdateFn:", error);
    return { status: 0, message: "Error processing task.", data: [] };
  }
};
