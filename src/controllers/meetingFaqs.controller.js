const { CREATED, UPDATE } = require("../config/action.config");
const { chatGPTBot, syncChatGptResp } = require("../services/chatGptService");
const CommonService = require("../services/CommonService");
const {
  getAllFAQsFn,
  getFAQsByIdFn,
  saveFAQsFn,
} = require("../services/meetingFAQsService");

// <========= GET ALL FAQS DATA ========>
exports.getAllFaqs = async (req, res) => {
  try {
    let baseOptions = {
      where: {
        deleted: 0,
      },
    };

    let resp = await getAllFAQsFn(baseOptions);
    if (resp) {
      return res.send({
        status: 1,
        message: "Data Fetch SuccessFully.",
        data: resp,
      });
    } else {
      return res.send({
        status: 0,
        message: "No Record Found",
      });
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

//  <========= GET DATA BY IDS =============>
exports.getFAQsById = async (req, res) => {
  try {
    let id = req.params.id;
    let baseOptions = {
      where: {
        deleted: 0,
        meeting_id: id,
      },
    };
    let resp = await getAllFAQsFn(baseOptions);
    if (resp) {
      return res.send({
        status: 1,
        message: "Data Fetch SuccessFully.",
        data: resp,
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

//<=================create FAQS==================>
exports.createFAQs = async (req, res) => {
  try {
    let data = CommonService.trimBodyData(req.body);
    let userId = req.userId;
    let options = { id: req.userId };
    data.createdBy - req.userId;
    let resp = await saveFAQsFn(data);

    if (resp) {
      options = await CommonService.actionLogs(
        "meeting_faqs",
        resp?.id,
        CREATED,
        options,
        resp?.id,
        userId,
        req.connection.remoteAddress
      );

      return res.send({
        status: 1,
        message: "Create SuccessFully.",
      });
    } else {
      return res.send({
        status: 0,
        message: "Unable to create",
      });
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// <================ edit FAQS ==================>
exports.editFAQs = async (req, res) => {
  try {
    let data = CommonService.trimBodyData(req.body);
    let id = req.params.id;
    let userId = req.userId;
    let options = { id: req.userId };
    data.updatedBy = userId;

    // get data by its id====>
    let baseOptions = {
      where: {
        id: id,
        deleted: 0,
      },
    };
    let response = await getFAQsByIdFn(baseOptions);

    if (response) {
      options = await CommonService.actionLogs(
        "meeting_faqs",
        response?.id,
        UPDATE,
        options,
        response?.id,
        userId,
        req.connection.remoteAddress
      );
      await response.update(data, options);
      return res.send({
        status: 1,
        message: "Edit Data SuccessFull.",
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

// <================= implement the chatgpt chatbot for FAQs ====================>
exports.generateFAQsAnswer = async (req, res) => {
  try {
    let id = req.params.id;
    let data = CommonService.trimBodyData(req.body);
    let response;
    data = {
      ...data,
      meeting_id: id,
      ipAddress : req.connection.remoteAddress ,
      userId : req.userId
    };
    if (data.prompt) {
      response = await chatGPTBot(data , req?.userId);
    }
    if (response?.status === 1) {
      // update the FAQ table ==============>
      return res.send({
        status: 1,
        message: "success",
        textValue: response?.data?.message[0]?.content[0]?.text?.value,
      });
    } else {
      return res.send({
        status: response?.status,
        message: response?.message,
      });
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// <================= implement the sync api ================>
exports.syncChatgptStatus = async (req, res) => {
  try {
    let id = req.params.id;
    let resp = await syncChatGptResp(id, true , req.connection.remoteAddress , req.userId);
    if (resp?.status===1) {
      return res.send({
        status: 1,
        message: "Update the chatgpt status.",
        CurrentStatus: resp.runStatus,
      });
    } else {
      return res.send({
        status: resp.status,
        message: resp.message || "something went wrong.",
      });
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};
