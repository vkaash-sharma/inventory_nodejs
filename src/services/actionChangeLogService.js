const models = require("../models/index");

exports.getActionLogFn = async (option) => {
  try {
    let response = await models.table_action_logs.findAll(option);

    return response;
  } catch (error) {
    console.error("Error occurred:", error);
  }
};


exports.getSingleActionLog = async (option) => {
    try {
      let response = await models.table_action_logs.findOne(option);
      return response;
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };
