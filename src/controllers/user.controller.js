const models = require("../models");
const CommonService = require("../services/CommonService");
const UserServices = require("../services/UserServices");
const AuthServices = require("../services/AuthServices");
const { CREATED, UPDATE } = require("../config/action.config");
const { SaveEventService } = require("../services/EventService");
const EVENTS_CONSTANTS = require("../config/events.config");
const URL_CONFIG = require("../config/urls.config");
const { Op } = require("sequelize");

// Get All Users==========>
exports.getAllUsersFn = async (req, res) => {
  try {
    let { filter, sort, search, sortBy, orderBy, page, limit, q } = req.query;

    let options = {
      where: {
        deleted: 0,
      },
      include: [
        {
          association: "userRole",
          required: true,
          include: {
            association: "role",
            required: true,
          },
        },
        {
          association: "UserCompanyAccess",
          required: false,
          where: {
            deleted: 0,
          },
        },
      ],
    };
    let optionsForCount = {
      where: {
        deleted: 0,
      },
    };
    options = await CommonService.filterAndSort(options, filter, sort);
    options = await CommonService.searchAndSortBy(
      options,
      search,
      (sortBy = null),
      orderBy,
      +page,
      +limit,
      models
    );

    optionsForCount = await CommonService.filterAndSort(
      optionsForCount,
      filter,
      sort
    );
    optionsForCount = await CommonService.searchAndSortBy(
      optionsForCount,
      search,
      (sortBy = null),
      orderBy,
      +page,
      +limit,
      models
    );

    if (q) {
      options.where = {
        ...options.where,
        [Op.or]: [
          { firstName: { [Op.like]: `%${q}%` } },
          { lastName: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
        ],
      };
      optionsForCount.where = {
        ...optionsForCount.where,
        [Op.or]: [
          { firstName: { [Op.like]: `%${q}%` } },
          { lastName: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
        ],
      };
    }
    const { rows, count1 } = await UserServices.getAllUsersFnRowsAndCount(
      options,
      [
        "password",
        "verification_token",
        "email_verify",
        "activeStatus",
        "createdAt",
        "updatedAt",
        "deleted",
      ]
    );

    const { rows1, count } = await UserServices.getAllUsersFnRowsAndCount(
      optionsForCount,
      [
        "password",
        "verification_token",
        "email_verify",
        "activeStatus",
        "createdAt",
        "updatedAt",
        "deleted",
      ]
    );

    if (count) {
      return res.send({
        status: 1,
        message: "Data Fetch SuccessFully",
        totalCount: count,
        recordCount: rows.length,
        currentPage: page ? +page : undefined,
        nextPage: page ? parseInt(page) + 1 : undefined,
        data: rows,
      });
    } else {
      return res.send({
        status: 0,
        message: "No Record Found",
      });
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};
// REGISTER THE NEW EMPLOYEE==============>
exports.createUser = async (req, res) => {
  try {
    let data = CommonService.trimBodyData(req.body);
    let userId = req.userId;
    let { firstName, lastName, email, password, mobile } = data;

    const checkEmailExists = await UserServices.getSingleUserByEmail(email);

    if (checkEmailExists) {
      return res.REST.CONFLICT(0, {
        msg: "User with email:{{email}} already exists",
        msgReplace: { email },
      });
    }

    // create the hashed password========>
    let hashedPassword = await AuthServices.generateHash(password);

    const result = await UserServices.saveNewUser({
      firstName ,
      lastName ,
      email ,
      hashedPassword ,
      mobile ,
      isActive: 1,
    });
    const options = { userId: result?.id };
    if (result) {
      // action logs for the Create User=====>
      await CommonService.actionLogs(
        "users",
        result?.id,
        CREATED,
        options,
        req?.userId,
        userId,
        req.connection.remoteAddress
      );

      await models.users.update(
        { createdBy: result.id }, // Assuming req.user.id is the id of the user who created the new employee
        { where: { id: result.id } }
      );

      // add userRoles in the respected user====>
      let dataUserRole = {
        userId: result.id,
        roleId: 2,
      };
      let userRoleRes = await UserServices.saveUserRole(dataUserRole);

      // const { verificationLink } = await AuthServices.GenerateVerifyUrl(
      //   URL_CONFIG.account_verify_url,
      //   result.id
      // );

      // SaveEventService(EVENTS_CONSTANTS.ACCOUNT_VERIFICATION, {
      //   userId: result.id,
      //   email_to: result.email,
      //   replacements: {
      //     EMPLOYEE_NAME: `${result.name}`,
      //     VERIFICATION_LINK: verificationLink,
      //   },
      // });

      return res.REST.SUCCESS(1, {
        msg: "Account with email:{{email}} Register Successfully",
        msgReplace: { email: email },
      });
    } else {
      return res.REST.ERROR(0, "Failed to Create Account");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// View Logged User Profile==============>
exports.getLoggedUser = async (req, res) => {
  try {
    let userId = req.userId;
    let options = {
      where: {
        id: userId,
        deleted: 0,
      },
    };

    const user = await UserServices.getSingleUserByID(options, [
      "password",
      "verification_token",
      "email_verify",
      "activeStatus",
      "id",
      "createdAt",
      "updatedAt",
      "deleted",
    ]);

    if (!user) {
      return res.REST.NOTFOUND(0);
    }
    return res.REST.SUCCESS(1, "User Found Successfully", user);
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// Edit Self Profile  ==============>
exports.editSelfProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const data = CommonService.trimBodyData(req.body);
    const user = await UserServices.getSingleUser(userId, [
      "password",
      "activeStatus",
      "verification_token",
      "email_verify",
      "activeStatus",
      "createdAt",
      "updatedAt",
      "deleted",
    ]);
    let actionLogOption = {
      id: req?.userId,
    };

    actionLogOption = await CommonService.actionLogs(
      "users",
      user.id,
      UPDATE,
      actionLogOption,
      req?.userId,
      req?.userId,
      req.connection.remoteAddress
    );
    if (user) {
      await user.update(data, actionLogOption);

      return res.REST.SUCCESS(1, "Profile Updated Successfully", { user });
    } else {
      return res.REST.NOTFOUND(0, "Account Not Found");
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};

// View User (Get User By ID) Profile==============>
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    let options = {
      where: {
        id: id,
        deleted: 0,
      },
      include: [
        {
          association: "userRole",
          include: {
            association: "role",
          },
        },
        {
          association: "UserCompanyAccess",
          required: false,
          where: {
            deleted: 0,
          },
        },
      ],
    };
    const user = await UserServices.getSingleUserByID(options, [
      "password",
      "verification_token",
      "email_verify",
      "activeStatus",
      "id",
      "createdAt",
      "updatedAt",
      "deleted",
    ]);
    if (user) {
      return res.REST.SUCCESS(1, "User Fetched Successfully", { user });
    } else {
      return res.REST.NOTFOUND(0, "User Not Found!");
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};

// Change Password By Self
exports.changeUserPassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { oldPassword, password, confirmPassword } =
      CommonService.trimBodyData(req.body);

    /* ===========check wheather the oldPassword is not similar with the old password;
        if password is not same as the confirm passwor logout ============== */
    const { status, message } = await UserServices.changePasswordValidation(
      oldPassword,
      password,
      confirmPassword
    );
    if (!status) {
      return res.REST.BADREQUEST(0, message);
    }
    let options = {
      where : {
        id : userId ,
        deleted : 0
      }
    }
    //second parameter in getSingleUserById is the field which should be excluded (password , verification_token)
    let user = await UserServices.getSingleUserByID(options, []);
    if (user) {
      const validPassword = await AuthServices.comparePassword(
        oldPassword,
        user.password
      );
      if (!validPassword) {
        return res.REST.UNAUTHORIZED(0, "Invalid Password");
      }
      const hashedPassword = await AuthServices.generateHash(password);

      let actionLogOption = { id: req?.userId };
      actionLogOption = await CommonService.actionLogs(
        "change-password",
        user.id,
        UPDATE,
        actionLogOption,
        req?.user?.id,
        req?.userId,
        req.connection.remoteAddress
      );

      await UserServices.updateUser(
        { password: hashedPassword, updatedBy: userId },
        user.id,
        actionLogOption,
        user?.id
      );
      return res.REST.SUCCESS(1, "Password Changed Successfully");
    } else {
      return res.REST.NOTFOUND(0, "User not found!");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// Edit User Password By a Another User Basically by any Admin
exports.editUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = CommonService.trimBodyData(req.body);
    const user = await UserServices.getSingleUser(userId, [
      "password",
      "email_verify",
      "verification_token",
      "activeStatus",
      "createdAt",
      "updatedAt",
      "deleted",
    ]);

    if (user) {
      let actionLogOption = {
        id: req?.userId,
      };
      actionLogOption = await CommonService.actionLogs(
        "users",
        user.id,
        UPDATE,
        actionLogOption,
        req.userId,
        userId,
        req.connection.remoteAddress
      );
      await user.update(data , actionLogOption);
      // make the actionLog for edit user=======>

      return res.REST.SUCCESS(1, "Profile Updated Successfully", user);
    } else {
      return res.REST.NOTFOUND(0, "User not found!");
    }
  } catch (error) {
    console.log("Error in catch block  : ", error);
    await CommonService.filterError(error, req, res);
  }
};

// delete the specifix user by its id===========>
exports.deleteUser = async (req, res) => {
  try {
    let id = req.params.id;
    let options = { id: req.userId };
    options = actionLogOption = await CommonService.actionLogs(
      "users",
      user.id,
      UPDATE,
      actionLogOption,
      userId,
      userId,
      req.connection.remoteAddress
    );
    let response = await UserServices.getSingleUserByID(id, []);
    if (response) {
      await response({ deleted: 0 }, options);
      return res.send({
        status: 1,
        message: "User Deleted Successfully",
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
