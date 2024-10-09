const {
  getActionLogFn,
  getSingleActionLog,
} = require("../services/actionChangeLogService");
const CommonService = require("../services/CommonService");

exports.getAllActionLogsDetails = async (req, res) => {
  try {
    let id = req.params.id;
    let type = req.query.type;
    let option = {
      where: {
        refrence_id: id,
        subModuleName: type,
        deleted: 0,
      },
      order: [["createdAt", "DESC"]],
    };
    let response = await getActionLogFn(option);
    if (response) {
      return res.send({
        status: 1,
        message: "Data Fetch SuccessFully.",
        data: response,
      });
    } else {
      return res.send({
        status: 0,
        message: "No Record Found",
        data: [],
      });
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};

exports.getAllActionLogBasedOnId = async (req, res) => {
  try {
    let id = req.params.id;
    let option = {
      where: {
        deleted: 0,
        id: id,
      },
      include: [
        {
          association: "actionChangeLogsDetails",
          required : false ,
          where: {
            deleted: 0,
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    };

    let response = await getSingleActionLog(option);
    if (response) {
      return res.send({
        status: 1,
        message: "Data Fetch SuccessFully.",
        data: response,
      });
    } else {
      return res.send({
        status: 0,
        message: "No Record Found",
        data: [],
      });
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};
