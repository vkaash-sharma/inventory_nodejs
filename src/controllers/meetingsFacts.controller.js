const { CREATED, UPDATE } = require("../config/action.config");
const CommonService = require("../services/CommonService");
const { getSpeakerFn } = require("../services/meetingFactsService");

exports.updateSuggestedSpeakers = async (req, res) => {
  try {
    let id = req.params.id;
    let data = req.body;
    let options = { id: req.userId };
    let baseOptions = {
      where: {
        deleted: 0,
        id: id,
        fact_name: "speakerDetails",
      },
    };
    let response = await getSpeakerFn(baseOptions);
    if (response) {
      options = await CommonService.actionLogs(
        "meeting_documents_facts",
        response?.id,
        UPDATE,
        options,
        response?.id,
        req.userId,
        req.connection.remoteAddress
      );

      await response.update({ fact_value_manual: JSON.stringify(data.data) , updatedBy : req.userId}, options);

      return res.send({
        status: 1,
        message: "Update Speaker SuccessFully.",
      });
    } else {
      return res.send({
        status: 0,
        message: "No Record Found",
        data: [],
      });
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};
