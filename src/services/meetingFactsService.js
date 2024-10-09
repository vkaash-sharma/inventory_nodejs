const models = require("../models/index");


exports.getSpeakerFn = async(options)=> {
  try {
    let response = await models.meeting_documents_facts.findOne(options);

    return response;

  }catch(error) {
    console.log("Error on getSpeakerFn", error);
  }
}