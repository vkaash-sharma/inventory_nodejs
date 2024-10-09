const { getUserRoleLevel } = require("../services/CommonService");
const {
  saveCompanyAdmins,
  getCompanyDetailsAndUpdateAdmins,
} = require("../services/companyAdminService");
const CommonService = require("../services/CommonService");
const { CREATED, UPDATE } = require("../config/action.config");
const {
  getAllCompaniesFn,
  getCompanyByIdFn,
  saveNewCompany,
  truncateAndCopyData,
} = require("../services/companyService");
const { companyAccessLevel, companyAccessLevelFn } = require("../services/userAccessService");

// getAll companies data===========>
  exports.getAllcompanies = async (req, res) => {
    try {
      const userId = req.userId;
      const userRoleLevel = getUserRoleLevel(req.user);
      const baseOptions = {
        where: {
          deleted: 0,
        },
        attributes: ["createdAt", "updatedAt", "deleted"],
        order: [
          ['createdAt', 'DESC'] 
        ],
      };
  
      let options = { ...baseOptions };
  
      if (userRoleLevel?.level === 0) {
        // For super admin, add the isSuperAdmin flag
        const companyRes = await getAllCompaniesFn(options);
  
        if (Array.isArray(companyRes)) {
          const result = companyRes.map(company => ({
            ...company.dataValues,
            isSuperAdmin: 1
          }));
          return res.REST.SUCCESS(1, "Companies Found Successfully", result);
        }
      } else {
        // For non-super admin, include additional associations
        options.include = [
          {
            association: "companiesAdmins",
            required: true,
          },
          {
            association: "UsercompanyAccess",
            required: true,
            where: {
              deleted: 0,
              userId: userId
            }
          }
        ];
        const companyRes = await getAllCompaniesFn(options);
  
        if (!companyRes) {
          return res.REST.NOTFOUND(0, "No Companies Found");
        }
        return res.REST.SUCCESS(1, "Companies Found Successfully", companyRes);
      }
  
      return res.REST.NOTFOUND(0, "No Companies Found");
    } catch (error) {
      console.error("Error in getAllcompanies:", error);
      await CommonService.filterError(error, req, res);
    }
  };
  

// getAll companies data===========>
  exports.getCompanyById = async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.userId;
      const userRoleLevel = getUserRoleLevel(req.user);
      let companyAccessCheckRes = await companyAccessLevelFn(id,userId,userRoleLevel?.level);
      if(!companyAccessCheckRes.status) {
        return res.send({
          status : 0 ,
          message : companyAccessCheckRes.message 
        })
      }
  
      if (!id) {
        return res.REST.ERROR(0, "Unable to find the id.");
      }
  
      // Base options for query
      const baseOptions = {
        where: {
          id,
          deleted: 0,
        },
        attributes: ["createdAt", "updatedAt", "deleted"],
        include: [
          {
            association: "companiesAdmins",
            attributes: { exclude: ["createdAt", "updatedAt", "deleted"] },
            where: { deleted: 0 },
            required: false,
            include: [
              {
                association: "userDetails",
                attributes: ["id", "firstName", "lastName", "email", "mobile"],
                where: { deleted: 0 },
              },
            ],
          },
        ],
      };
  
      // Extend options for non-super admins
      if (userRoleLevel?.level !== 0) {
        baseOptions.include.push({
          association: "UsercompanyAccess",
          required: false,
          where: {
            deleted: 0,
            userId,
          },
        });
      }
  
      // Fetch company data
      const companyRes = await getCompanyByIdFn(baseOptions);
  
      if (!companyRes) {
        return res.REST.NOTFOUND(0, "No company registered with this id.");
      }
  
      // Add `isSuperAdmin` flag if applicable
      if (userRoleLevel?.level === 0) {
        return res.REST.SUCCESS(1, "Company found successfully", {
          ...companyRes.dataValues,
          isSuperAdmin: 1,
        });
      }
  
      return res.REST.SUCCESS(1, "Company found successfully", companyRes);
    } catch (error) {
      console.error("Error in getCompanyById:", error);
      await CommonService.filterError(error, req, res);
    }
  };
  

// post companyData ============>
exports.postCompany = async (req, res) => {
  try {
    const data = CommonService.trimBodyData(req.body);
    let userId = req.userId
    const { name, shortName, logo, companyAdmins } = data;
    data.createdBy = req.userId;
    let result = await saveNewCompany(data);
    const options = { userId: result?.id };

    if (result) {
      await CommonService.actionLogs(
        "companies",
        result?.id,
        CREATED,
        options,
        req.userId,
        userId ,
        req.connection.remoteAddress
      );

      // create companyAdmins for the company ===>
      let companyAdminsOptions = {
        companyAdmins: companyAdmins,
        companyId: result?.id,
        createdBy: req.userId,
      };
      const responseCreateAdmins = await saveCompanyAdmins(
        companyAdminsOptions
      );
   
      //<================TRUNCATE AND COPY DATA IN THE USER ACCESS TABEL====>
    await truncateAndCopyData()
      return res.send({
        status: 1,
        message: "Company Successfully created.",
        data: result,
      });
    } else {
      return res.REST.ERROR(0, "Failed to create Company");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};
// THIS CONTROLLER WILL UPDATE COMPANY BY ID
exports.EditCompany = async (req, res) => {
  try {
    const id = req.params.id;
    const data = CommonService.trimBodyData(req.body);
    const userId = req.userId;
    const { name, shortName, logo, companyAdmins } = data;
    const userRoleLevel = getUserRoleLevel(req.user);
    let companyAccessCheckRes = await companyAccessLevelFn(id,userId,userRoleLevel?.level);
      if(!companyAccessCheckRes.status) {
        return res.send({
          status : 0 ,
          message : companyAccessCheckRes.message 
        })
      }
    let options = {
      where: {
        id: id,
        deleted: 0,
      },
    };
  
    let companyAdminsOptions = {
      companyAdmins: companyAdmins,
      companyId: id,
      createdBy: req.userId,
    };
    const company = await getCompanyByIdFn(options, ["createdAt", "updatedAt"]);
    if (company) {
      let actionLogOption = {
        id: req?.userId,
      };
      actionLogOption = await CommonService.actionLogs(
        "companies",
        company.id,
        UPDATE,
        actionLogOption,
        req?.userId,
        req?.userId,
        req?.connection?.remoteAddress
      );
      
      await company.update({ name: name, shortName: shortName, logo: logo  , updatedBy : req.userId},actionLogOption);
      // Edit company Upations =======>
      getCompanyDetailsAndUpdateAdmins(id , companyAdmins ,companyAdminsOptions ,req.userId , actionLogOption);
    
      //<=====================TRUNCATE AND COPY DATA IN THE USER ACESS=======>

       await truncateAndCopyData()

      return res.REST.SUCCESS(1, "Company Updated Successfully", { company });
    } else {
      return res.REST.NOTFOUND(0, "Company Not Found");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// delete Company==============>
exports.deleteCompany = async (req, res) => {
  try {
    const id = req?.params?.id;
    let options = {
      where: {
        id: id,
        deleted: 0,
      },
    };
    let company = await getCompanyByIdFn(options, ["createdAt", "updatedAt"]);
    if (company) {
      let actionLogOption = {
        id: req?.userId,
      };
      actionLogOption = await CommonService.actionLogs(
        "companies",
        company.id,
        UPDATE,
        actionLogOption,
        req?.userId,
        req,
        res
      );
      await company.update({ deleted: 1 , updatedBy: req.userId } ,actionLogOption);
      return res.REST.SUCCESS(1, "Delete Company Successfully", { company });
    } else {
      return res.REST.NOTFOUND(0, "Company Not Found");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};
