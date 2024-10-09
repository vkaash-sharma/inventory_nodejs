const models = require("../models/index");

exports.getMeetingDocFn = async(options , excludedItems) => {
    try {
      let resp = await models.meeting_documents.findAll({
        ...options ,
        attributes : {
            exclude : excludedItems || ["createdAt", "updatedAt", "deleted"]
        }
      });
      return resp;
    }catch(error) {
        console.log("Error on meeting Documents  ", error);
    }
} 