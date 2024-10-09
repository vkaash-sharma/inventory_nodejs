const { UPDATE } = require("../config/action.config");
const models = require("../models/index");
const {
  createChangeLogs,
  actionLogs,
  compareArrays,
} = require("./CommonService");

// create Single doc data
exports.saveMeetingDocsSingleCreate = async (data) => {
  try {
    let response = await models.meeting_documents.create(data, { raw: true });

    return response;
  } catch (error) {
    console.log("Error on meeting Documents  ", error);
  }
};

exports.getSingleDocDetails = async (option) => {
  try {
    let resp = await models.meeting_documents.findOne(option);

    return resp;
  } catch (error) {
    console.log("Error on meeting Documents  ", error);
  }
};

exports.getAllDocumentFn = async (option) => {
  try {
    let resp = await models.meeting_documents.findAll(option);

    return resp;
  } catch (error) {
    console.log("Error on meeting Documents  ", error);
  }
};

// <=============meeting documents =================>
exports.saveMeetingDocs = async (data) => {
  try {
    let bulkMeetingDocObj = data?.meeting_documents?.map((item) => ({
      meeting_id: data.meeting_id,
      document_url: item.document_url,
      document_type: item.document_type,
      instruction: item.instruction,
      createdBy: data.createdBy,
      process_status: 0,
    }));

    let response = await models.meeting_documents.bulkCreate(
      bulkMeetingDocObj,
      { raw: true }
    );

    return response;
  } catch (error) {
    console.log("Error on meeting Documents  ", error);
  }
};

// save single meeting document===========>
exports.saveMeetingDocsSingleFn = async (data) => {
  try {
    let response = await models.meeting_documents.create(data, { raw: true });

    return response;
  } catch (error) {
    console.log("Error on meeting Documents  ", error);
  }
};

exports.updateMeetingsDocuments = async (updatedValue, whereCondition) => {
  try {
    // First, get the IDs of the records that match the condition
    const recordsToUpdate = await models.meeting_documents.findAll({
      attributes: ["id"],
      where: whereCondition.where,
    });

    const idsToUpdate = recordsToUpdate.map((record) => record.id);

    // Perform the update
    const [affectedRows] = await models.meeting_documents.update(updatedValue, {
      where: whereCondition.where,
    });

    return {
      affectedRows,
      updatedIds: idsToUpdate,
    };
  } catch (error) {
    console.log("Error in Update task user Fn:::: ", error);
    throw error;
  }
};

// <=================update meeting documents======>
exports.updateMeetingDocuments = async (
  options,
  data,
  userId,
  actionLogOption
) => {
  try {
    // <=============soft delete all previous documents====>
    // fetch all data to that meeting id ======================>
    let baseOptions = {
      where: {
        meeting_id: data?.meeting_id,
        deleted: 0,
      },
    };
    let res = await this.getAllDocumentFn(baseOptions);
    const documentsWithoutId = data?.meeting_documents.filter(
      (document) => !document.id
    );
    let existingIds = [];
    let requestedIds = [];
    for (let i = 0; i < res?.length; i++) {
      let idVal = res[i]?.dataValues?.id;
      if (idVal) {
        existingIds.push(+idVal);
      }
    }
    if (data?.meeting_documents?.length > 0) {
      for (let i = 0; i < data.meeting_documents.length; i++) {
        let singleId = data?.meeting_documents[i]?.id;
        if (singleId) {
          requestedIds.push(singleId);
        }
      }
    }
    let { commonValues, newValues, missingValues } = compareArrays(
      existingIds,
      requestedIds
    );
    if (missingValues.length > 0) {
      for (let i = 0; i < missingValues.length; i++) {
        let baseOpt = {
          where: {
            id: missingValues[i],
            deleted: 0,
          },
        };
        let resp = await this.getSingleDocDetails(baseOpt);
        await resp.update({ deleted: 1, updatedBy: userId }, actionLogOption);
      }
    }

    if (documentsWithoutId.length > 0) {
      for (let i = 0; i < documentsWithoutId.length; i++) {
        let updatedData = {
          meeting_id: data?.meeting_id,
          createdBy: userId,
          ...documentsWithoutId[i],
        };
        let resp = await this.saveMeetingDocsSingleFn(updatedData);
      }
    }
  } catch (error) {
    console.log("Error on meeting Documents  ", error);
  }
};
