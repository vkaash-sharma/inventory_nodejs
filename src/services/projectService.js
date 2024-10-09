const models = require("../models/index");
const { getUserRoleLevel } = require("./CommonService");
const { isCompanyAdmins } = require("./companyAdminService");
const { isMeetingParticipant } = require("./meetingParticipants");
const {Op} = require('sequelize')

// <===============GET ALL PROJECTS FUNCTIONS================>
exports.getAllProjectsFn = async (options, excludeItems) => {
  try {
    let projectResp = await models.projects.findAll({
      ...options,
      attributes: {
        exclude: excludeItems ? excludeItems : ["updatedAt", "deleted"],
      },
    });
    return projectResp;
  } catch (error) {
    console.log("Error in getting companies all data : ", error);
  }
};

// <===================GET ALL PROJECT BY ID ==================>
exports.getAllProjectById = async (options, excludeItems) => {
  try {
    let projectResp = await models.projects.findOne({
      ...options,
      attributes: {
        exclude: excludeItems
          ? excludeItems
          : ["createdAt", "updatedAt", "deleted"],
      },
    });
    return projectResp;
  } catch (error) {
    console.log("Error in getting companies all data : ", error);
  }
};

// <================== SAVE NEW PROJECT ======================>

exports.saveNewProject = async ({ projectName, companyId, userId }) => {
  try {
    let newRes = await models.projects.create({
      projectName,
      companyId,
      createdBy: userId,
    });

    return newRes;
  } catch (error) {
    console.log("Error in getting companies all data : ", error);
  }
};
// <================GET THE ACCESSED PROJECT BASED ON THE USER ROLE===========>
exports.getAccessedProjects = async (data, options) => {
  try {
    // check if the user is a super admin===>
    let userRoleLevel = getUserRoleLevel(data.user);
    let resp;
    // if the user is super admin====>
    if (userRoleLevel?.level === 0) {
      resp = await this.getAllProjectsFn(options);
    } else {
      let adminOpt = {
        where: {
          userId: data.userId,
          companyId: data.companyId,
          deleted: 0,
        },
      };
      let checkAdmin = await isCompanyAdmins(adminOpt);
      //::::::::::::::::: means its a admin for the particular company:::::::::::::::::::
      if (checkAdmin) {
        resp = await this.getAllProjectsFn(options);
      } else {
        // fetch all the associated participants ===>
          let participantOpt = {
            where : {
              userId : data.userId ,
              deleted : 0
            },
            include : [{
              association : "meetingDetails" ,
              where : {
                companyId : data.companyId ,
                deleted : 0
              }
            }]

          }
          let getParticipants = await isMeetingParticipant(participantOpt)
          let getIds = [...new Set(getParticipants?.map((item) => {
            return item?.dataValues?.meetingDetails.projectId;
        }))];
        
        let userAccessOpt = {
          where: {
            id: {
              [Op.in]: getIds
            }
          },
          order: [
            ['createdAt', 'DESC'] 
          ],
        };
      
        resp = await this.getAllProjectsFn(userAccessOpt);
      }
    }

    return resp;
  } catch (error) {
    console.log("Error in getting companies all data : ", error);
  }
};
