const { UPDATE, CREATED } = require("../config/action.config");
const models = require("../models/index");
const { compareArrays, actionLogs } = require("./CommonService");
const { getCompanyByIdFn } = require("./companyService");
const { Op } = require("sequelize");

//<============check if the user is company admin or not =======>
exports.isCompanyAdmins = async (options) => {
  try {
    let resp = await models.company_admins.findOne(options);

    return resp;
  } catch (error) {
    console.log("Error in  isCompanyAdmins :::::", error);
  }
};

// <=====================find all the companyAdmin ====================>
exports.allCompanyAdminsFn = async (options) => {
  try {
    let resp = await models.company_admins.findAll(options);

    return resp;
  } catch (error) {
    console.log("Error in  isCompanyAdmins :::::", error);
  }
};

// get company admin by id====>
exports.getCompanyById = async (options, excludedItems) => {
  try {
    let res = await models.company_admins.findOne({
      ...options,
      attributes: {
        exclude: excludedItems || ["createdAt", "updatedAt"],
      },
    });
    return res;
  } catch (error) {
    console.log("Error in  isCompanyAdmins :::::", error);
  }
};

// exports save company admins===>
exports.saveCompanyAdminsFn = async (data) => {
  try {
    let resp = await models.company_admins.bulkCreate(data);
    return resp;
  } catch (error) {
    console.log("Error in getting companies all data : ", error);
  }
};
// <==================save company admins =====================>
exports.saveCompanyAdmins = async (data) => {
  try {
    // Prepare the array of objects to insert
    const companyAdminRecords = data.companyAdmins.map((userId) => ({
      userId,
      companyId: data.companyId,
      createdBy: data.createdBy,
    }));

    // Use bulkCreate to insert multiple records at once
    const companyAdmins = await models.company_admins.bulkCreate(
      companyAdminRecords,
      { raw: true }
    );

    return companyAdmins;
  } catch (error) {
    console.log("Error in getting companies all data : ", error);
  }
};

exports.updateCompanyAdminFn = async (updatedValue, whereCondition) => {
  try {
    let resp = await models.company_admins.update(updatedValue, whereCondition);
    return resp;
  } catch (error) {
    console.log("Error in Updated task service::::: ", error);
  }
};
// <==================update company admins ===================>
exports.updateCompanyAdmin = async (options, updationValue) => {
  try {
    // remove the previous entries and add new ones====>
    await models.company_admins.update(
      { deleted: 1 },
      { where: { companyId: options.where.id } }
    );

    // create new updateValues======>

    const companyAdminRecords = updationValue.companyAdmins.map((userId) => ({
      userId,
      companyId: updationValue.companyId,
      updatedBy: updationValue.updatedBy,
    }));

    // Use bulkCreate to insert multiple records at once
    const companyAdmins = await models.company_admins.bulkCreate(
      companyAdminRecords,
      { raw: true }
    );

    return companyAdmins;
  } catch (error) {
    console.log("Error in getting companies all data : ", error);
  }
};

exports.getCompanyDetailsAndUpdateAdmins = async (
  id,
  requestedIds,
  data,
  userId,
  actionLogOption
) => {
  try {
    let options = { id: userId };
    let baseOptions = {
      where: {
        id: id,
        deleted: 0,
      },
      include: [
        {
          association: "companiesAdmins",
          required: true,
          where: {
            deleted: 0,
          },
        },
      ],
    };
    let resp = await getCompanyByIdFn(baseOptions);
    let expectedIds = resp?.dataValues?.companiesAdmins.map(
      (item) => item.dataValues.userId
    );

    let { commonValues, newValues, missingValues } = compareArrays(
      expectedIds,
      requestedIds
    );

    if (missingValues.length > 0) {
      for (let i = 0; i < missingValues.length; i++) {
        let userIdVal = missingValues[i];
        let whereCondition = {
          where: {
            userId: userIdVal,
            companyId: id,
            deleted: 0,
          },
        };
        let companyDetailsRes = await this.getCompanyById(whereCondition);
        await companyDetailsRes.update(
          { deleted: 1, updatedBy: userId },
          actionLogOption
        );
      }
    }

    if (newValues.length > 0) {
      let newAdminsData = newValues.map((i) => ({
        userId: i,
        companyId: data.companyId,
        createdBy: data.createdBy,
      }));
      let resp = await this.saveCompanyAdminsFn(newAdminsData);
    }
  } catch (error) {
    console.log("Error in getCompanyDetailsAndUpdateAdmins::::: ", error);
  }
};
