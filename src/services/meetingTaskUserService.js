const models = require("../models/index");


exports.getAllTaskUsers =  async(options) => {
    try {
    let resp = await models.meeting_task_users.findAll(options);
    return resp
    }catch(error) {
        console.log("check complete task user error:::::::::: " , error)
    }
}


exports.getSingleTaskUsers =  async(options) => {
  try {
  let resp = await models.meeting_task_users.findOne(options);
  return resp
  }catch(error) {
      console.log("check complete task user error:::::::::: " , error)
  }
}

exports.saveMeetingTaskUsersSingle = async(data) => {
    try {
        let resp = await models.meeting_task_users.create({
            meeting_task_id : data.meeting_task_id ,
            userId : data.userId ,
            status : data.status ,
            participant_id : data.participant_id ,
            completed_date : data.completed_date ,
            createdBy : data.createdBy
        });

        return resp;

    }catch(error) {
      console.log("Error in post task by meeting Single: ", error); 
    }
}

exports.saveMeetingTaskUsers = async (data) => {
    try {
        
        let resObj = data.taskOwners.map((item) =>({
            meeting_task_id : data.meeting_task_id ,
            userId : item.userId ,
            participant_id : item.participant_id ,
            status : item.status ,
            completed_date : item.completed_date ,
            createdBy : data.createdBy
        }))

        // create  the bulk meeting task user======>
        let resp = await models.meeting_task_users.bulkCreate(resObj);

        return resp;

    }catch(error) {
        console.log("Error in get task by meeting : ", error);
    }
}

exports.updateTaskUserFn =  async (updatedValue, whereCondition) => {

    try {
      // First, get the IDs of the records that match the condition
      const recordsToUpdate = await models.meeting_task_users.findAll({
        attributes: ['id'],
        where: whereCondition.where
      });
  

      const idsToUpdate = recordsToUpdate.map(record => record.id);
  
      // Perform the update
      const [affectedRows] = await models.meeting_task_users.update(updatedValue, {
        where: whereCondition.where
      });
  
      return {
        affectedRows,
        updatedIds: idsToUpdate
      };
      
    } catch (error) {
      console.log("Error in Update task user Fn:::: ", error);
      throw error;
    }
  };
  