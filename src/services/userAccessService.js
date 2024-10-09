const models = require("../models/index");
const { isCompanyAdmins } = require("./companyAdminService");
const { getSingleParticipant } = require("./meetingParticipants");

exports.companyAccessLevelFn = async (companyId, userId, userRole) => {
  console.log("🚀 ~ exports.companyAccessLevelFn= ~ companyId, userId:", companyId, userId)
  // Directly handle cases based on userRole
  if (userRole === 0) {
    return {
      status: 1,
      message: "Access granted.",
    };
  }

  // Validate the presence of companyId and userId
  if (!companyId || !userId) {
    return {
      status: 0,
      message: "Company ID and User ID are required.",
    };
  }

  // Prepare options for checking admin status
  const adminOpt = {
    where: {
      companyId,
      userId,
      deleted: 0,
    },
  };

  try {
    // Check if the user is an admin
    const checkAdmin = await isCompanyAdmins(adminOpt);

    if (!checkAdmin) {
      return {
        status: 0,
        message: "You do not have permission to access this page.",
      };
    }

    return {
      status: 1,
      message: "Access granted.",
    };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return {
      status: 0,
      message: "An error occurred while checking permissions.",
    };
  }
};
exports.meetingAccessLevelFn = async (
  type,
  companyId,
  meetingId,
  userId,
  userRole
) => {
  if (userRole === 0) {
    return {
      status: 1,
      message: "Access granted.",
    };
  } else {
    switch (type) {
      case "read":
        let partiOptions = {
            where : {
                meetingId : meetingId ,
                userId : userId ,
                deleted : 0
            }
        }
        let resp = await getSingleParticipant(partiOptions);
        if (resp) {
          return {
            status: 1,
            message: "Access Grant.",
          };
        } else {
          const adminOpt = {
            where: {
              companyId,
              userId,
              deleted: 0,
            },
          };

          // Check if the user is an admin
          const checkAdmin = await isCompanyAdmins(adminOpt);
          if (checkAdmin) {
            return {
              status: 1,
              message: "Access Grant.",
            };
          } else {
            return {
              status: 0,
              message: "You do not have permission to edit this page.",
            };
          }
        }

      case "write":
        let partiOptionsWrite = {
            where : {
                meetingId : meetingId ,
                userId : userId ,
                roleInMeeting : "admin" ,
                deleted : 0
            }
        }
        let response = await getSingleParticipant(partiOptionsWrite);
        if(response){
            return {
                status : 1 ,
                message : "Access Grant"
            }
        }else {
            return {
                status : 0 ,
                message : "You do not have permission to access this page."
            }
        }

    }
  }
};
