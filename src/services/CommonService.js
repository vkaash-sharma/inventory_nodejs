const models = require('../models/index')
const clog = require('./ChalkService');
const i18n = require('../config/i18n.config')

exports.filterError = (error, req, res) => {
    clog.error('filterError', error);
    let return_data = {},
        http_status = 500;
    if (error !== undefined && error !== null && Object.keys(error).length != 0) {
        if (error.name !== undefined && error.name == "SequelizeValidationError") {
            //validation error
            let validattion_errors = {};
            for (let err in error.errors) {
                validattion_errors[err] = {
                    message: error.errors[err].message,
                    field: error.errors[err].path,
                    value: error.errors[err].value,
                };
            }
            http_status = 400;
            return_data = {
                status: 0,
                message: i18n.__n('VALIDATION_ERROR'),
                validation_error: validattion_errors,
            };
        } else {
            return_data = {
                status: 0,
                message: i18n.__n('EXCEPTION_ERROR'),
                error: error,
            };
        }
    } else {
        return_data = {
            status: 0,
            message: i18n.__n('EXCEPTION_ERROR'),
            error: error,
        };
    }
    // return response;
    return res.status(http_status).json(return_data);
};

exports.trimBodyData = (data) => {
    Object.keys(data).forEach((key) => {
        if (typeof data[key] == 'string') {
            data[key] = data[key].trim();
        }
    })

    return data;
}


//to track all the action -> ACTION Logs=====>
exports.actionLogs = async (subModuleName, recordId, actionName, options, createdBy, userIdVal , ipAddress) => {

    try {
        let date = new Date()
        let commitId = date.getTime()
        let userId = userIdVal
        let obj = {
            subModuleName: subModuleName,
            action: actionName,
            commit_id: commitId,
            refrence_id: recordId,
            ipAddress: ipAddress,
            createdBy: createdBy,
        }

        let actionTableModel = await models.table_action_logs.create(obj, {
            ...options,
            raw: true,
        })
        if (actionTableModel) {
            options.actionLogId = actionTableModel?.id
        }

        //return option with actionLogId
        return options
    } catch (error) {
        clog.error(error)
        return false;
    }
}


exports.compareArrays = (arr1, arr2) => {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
  
    const commonValues = [...set1].filter(value => set2.has(value));
    const newValues = [...set2].filter(value => !set1.has(value));
    const missingValues = [...set1].filter(value => !set2.has(value));
  
    return { commonValues, newValues, missingValues };
  }

exports.isMp3OrMp4 = (url)  => {
    // Regular expression to check if the URL ends with .mp3 or .mp4
    const regex = /\.(mp3|mp4)$/i;
    return regex.test(url);
}

exports.getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
}

exports.isString = (str) => {
    try {
        return typeof str === 'string'
    } catch (e) {
        return false
    }
}


exports.getUserRoleLevel = (user) => {
    return user?.userRole?.role;
}


exports.SuccessHandler = (res, data = null, message = "success", manualStatus = "") => {
    res.status(200).json({
      status: manualStatus !== "" ? manualStatus : data === null ? 0 : 1,
      message: message,
      data: data,
    });
  };
  
  exports.ErorHandler = (res, data = null, status = 400, message = "failed") => {
    res.status(status).json({
      status: 0,
      message: message,
      data: data,
    });
  };


  exports.getFileExtension = (filename) =>{
    // Extract the extension using regex or split method
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop() : ''; // Return the last part after the last dot
  }


exports.createChangeLogs = async(data) => {
    try {
      let resp = await models.table_change_logs.create(data);
      return resp;
    }catch(error) {
        console.error('Error occurred:', error);
    }
}



exports.filterAndSort = async (options, filter, sort, join_with) => {
    let sort_field = "id",
      sort_order = "DESC";
  
    var statusArray = [];
    var includeArray = [];
    let statusObj = {};
    var statusArray1 = [];
  
    if (filter) {
      for (const property in filter) {
        if (property == "status" && filter[property]) {
          statusArray = filter[property].split(",");
          statusObj = {
            status: {
              [Op.in]: statusArray,
            },
          };
          options.where[Op.or] = statusObj;
        } else if (filter[property] || filter[property] == 0) {
          statusArray = filter[property];
          // statusObj = {
          //     [property]: statusArray
          // }
          // options.where[Op.and] = statusObj;
          options.where[property] = statusArray;
        }
      }
    }
  
    if (typeof sort != "undefined") {
      options.order = [];
      // sort = sort ? JSON.parse(sort) : sort;
      for (const property in sort) {
        sort_field = property ? property : sort_field;
        sort_order = sort[property] ? sort[property] : sort_order;
        options.order.push([sort_field, sort_order]);
      }
    } else {
      sort_field = sort_field;
      sort_order = sort_order;
      options.order = [[sort_field, sort_order]];
    }
  
    if (join_with && typeof join_with != "undefined") {
      modelArray = join_with.split(",");
      console.log("modelArray", modelArray);
      modelArray.forEach((element) => {
        if (element in model) {
          let modelObj = {};
          modelObj.model = model[element];
          includeArray.push(modelObj);
        }
      });
      options.include = includeArray;
    }
  
    return options;
};

exports.searchAndSortBy = async (
    options,
    search,
    sortBy,
    orderBy,
    page,
    limit,
    model
  ) => {
    console.log("123456789")
    let sort_field = "id",
      sort_order = "DESC";
  
    var statusArray = [];
    let statusObj = {};
  
    if (search) {
      for (const property in search) {
        if (property == "status" && search[property]) {
          console.log("here is1");
          statusArray = search[property].split(",");
          statusObj = {
            status: {
              [Op.in]: statusArray,
            },
          };
  
          options.where[Op.or] = statusObj;
        } else if (property === "displayStatus" && search[property]) {
          const displayStatusValue = search[property];
          options.where[Op.or] = [
            { finalStatus: { [Op.like]: `%${displayStatusValue}%` } },
            { mfiFinalStatus: { [Op.like]: `%${displayStatusValue}%` } },
          ];
        } else if (property === "createdAt" && search[property]) {
          const createdAtValue = search[property];
          const createdAtString = moment(createdAtValue, "DD-MM-YYYY").format(
            "YYYY-MM-DD"
          );
          if (createdAtString) {
            options.where[property] = Sequelize.literal(
              `DATE_FORMAT(claims.createdAt, '%Y-%m-%d') = '${createdAtString}'`
            );
          }
        } else if (property === "startDateView" && search[property]) {
          const startDateValue = search[property];
          const startDateString = moment(startDateValue, "DD-MM-YYYY").format(
            "YYYY-MM-DD"
          );
  
          startDateString ? (options.where.startDate = startDateString) : "";
        } else if (property === "productName" && search[property]) {
          let fieldValue = search[property];
          options.where[property] = { [Op.like]: `%${fieldValue}%` };
        } else if (property === "masterPolicyNo" && search[property]) {
          let fieldValue = search[property];
          options.where[property] = { [Op.like]: `${fieldValue}%` };
        } else if (search[property] || search[property] === 0) {
          let fieldValue = search[property];
  
          if (this.isString(fieldValue)) {
            // Check if the property needs a 'like' query
            if (fieldValue.includes(",")) {
              options.where[property] = fieldValue.split(",");
            }
            const needsLikeQuery = [
              "loanAccountNumber",
              "memberName",
              "coiNumber",
              "type",
              "currentLevel",
              "policyPremium",
            ].includes(property);
  
            if (needsLikeQuery) {
              options.where[property] = { [Op.like]: `%${fieldValue}%` };
            } else {
              options.where[property] = fieldValue.split(",");
            }
          } else {
            options.where[property] = fieldValue;
          }
        }
      }
    }
  
    if (sortBy != undefined) {
      // it,s execute when association required
      if (sortBy.toString().includes("-")) {
        let associationList = sortBy.split("-");
        let sort_field1 = associationList.pop();
        let orderObj = [];
        let flag = 0;
        console.log(sort_field1);
        for (let modelName of associationList) {
          let attribute = serverSidePagination[modelName];
          console.log(attribute);
          if (Array.isArray(attribute) && attribute.includes(sort_field1)) {
            flag = 1;
          }
          orderObj.push(model[modelName]);
        }
  
        if (flag == 0)
          return {
            status: 0,
            message: "Attribute not found",
          };
        sort_order = orderBy ? orderBy : sort_order;
        sort_field = sort_field1 ? sort_field1 : sort_field;
  
        options.order = [orderObj.concat([sort_field, sort_order])];
      } else {
        options.order = [];
        sort_field = sortBy;
        sort_order = orderBy ? orderBy : sort_order;
        options.order.push([sort_field, sort_order]);
      }
    } else {
      sort_field = sort_field;
      sort_order = sort_order;
      options.order = [[sort_field, sort_order]];
    }
    console.log("pageLimit::::::::::::::::::::::;;" ,page , limit)
    if (page !== undefined && Number.isInteger(parseInt(page))) {
      limit = limit && Number.isInteger(parseInt(limit)) ? +limit : 5;
      page = parseInt(page);
      page = page - 1 >= 0 ? page - 1 : 0;
      options["limit"] = limit;
      options["offset"] = page ? page * limit : 0;
    }
  
    return options;
  };

  exports.compareArrays = (arr1, arr2)  => {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
  
    const commonValues = [...set1].filter((value) => set2.has(value));
    const newValues = [...set2].filter((value) => !set1.has(value));
    const missingValues = [...set1].filter((value) => !set2.has(value));
  
    return { commonValues, newValues, missingValues };
  }