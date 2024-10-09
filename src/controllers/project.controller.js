const CommonService = require("../services/CommonService");
const { CREATED, UPDATE } = require("../config/action.config");
const {
  getAllProjectsFn,
  saveNewProject,
  getAllProjectById,
  getAccessedProjects,
} = require("../services/projectService");
const { companyAccessLevelFn } = require("../services/userAccessService");

// getAllProjects=====>
exports.getAllProjects = async (req, res) => {
  try {
    let options = {
      where: {
        deleted: 0,
      },
    };
    let response = await getAllProjectsFn(options);
    if (response) {
      return res.send({
        status: 1,
        message: "Fetch Projects Successfully.",
        data: response,
      });
    } else {
      return res.send({
        status: 0,
        message: "No Records Found",
      });
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};

exports.getProjectById = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.userId;
    let companyId = req.query.companyId
    // <============companyId=============>
      const userRoleLevel = CommonService.getUserRoleLevel(req.user);
      let companyAccessCheckRes = await companyAccessLevelFn(companyId,userId,userRoleLevel?.level);
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
      include: [
        {
          association: "projectCompany",
        },
      ],
    };

    let response = await getAllProjectById(options);

    if (response) {
      return res.send({
        status: 1,
        message: "Fetch Projects Successfully.",
        data: response,
      });
    } else {
      return res.send({
        status: 0,
        message: "No Records Found",
      });
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};

// getAllProjects By companyId=====>
exports.getAllProjectsByCompanyId = async (req, res) => {
  try {
    let { id } = req.params;
    let userId = req.userId;
    const userRoleLevel = CommonService.getUserRoleLevel(req.user);
    let companyAccessCheckRes = await companyAccessLevelFn(
      id,
      userId,
      userRoleLevel?.level
    );
    if (!companyAccessCheckRes.status) {
      return res.send({
        status: 0,
        message: companyAccessCheckRes.message,
      });
    }
    let options = {
      where: {
        companyId: id,
        deleted: 0,
      },
      order: [["createdAt", "DESC"]],
    };
    let data = {
      userId: req.userId,
      companyId: id,
      user: req.user,
    };
    //<=================get the accessed projects==================>
    let response = await getAccessedProjects(data, options);

    if (response) {
      return res.send({
        status: 1,
        message: "Fetch Projects Successfully.",
        data: response,
      });
    } else {
      return res.send({
        status: 0,
        message: "No Records Found",
      });
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};

exports.createNewProjects = async (req, res) => {
  try {
    let data = CommonService.trimBodyData(req.body);
    let userId = req.userId;
    let { projectName, companyId } = data;
    const userRoleLevel = CommonService.getUserRoleLevel(req.user);
    let companyAccessCheckRes = await companyAccessLevelFn(
      companyId,
      userId,
      userRoleLevel?.level
    );
    if (!companyAccessCheckRes.status) {
      return res.send({
        status: 0,
        message: companyAccessCheckRes.message,
      });
    }
    let response = await saveNewProject({ projectName, companyId, userId });

    if (response) {
      const options = { id: response?.id };
      await CommonService.actionLogs(
        "projects",
        response?.id,
        CREATED,
        options,
        req?.userId,
        userId,
        req.connection.remoteAddress
      );

      return res.send({
        status: 1,
        message: "Project Create Successfully",
        data: response,
      });
    } else {
      return res.send({
        status: 0,
        message: "No record Found",
        data: [],
      });
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};

exports.editProject = async (req, res) => {
  try {
    let userId = req.userId;
    let id = req.params.id;
    let data = CommonService.trimBodyData(req.body);
    let { projectName, companyId } = data;
    const userRoleLevel = CommonService.getUserRoleLevel(req.user);
    let companyAccessCheckRes = await companyAccessLevelFn(
      companyId,
      userId,
      userRoleLevel?.level
    );
    if (!companyAccessCheckRes.status) {
      return res.send({
        status: 0,
        message: companyAccessCheckRes.message,
      });
    }
    data.updatedBy = req.userId;

    let options = {
      where: {
        id: id,
        deleted: 0,
      },
    };

    let project = await getAllProjectById(options);
    let actionLogOption = {
      id: req?.userId,
    };
    actionLogOption = await CommonService.actionLogs(
      "projects",
      project.id,
      UPDATE,
      actionLogOption,
      req?.userId,
      userId,
      req.connection.remoteAddress
    );
    if (project) {
      await project.update(data, actionLogOption);

      return res.REST.SUCCESS(1, "Project Updated Successfully", project);
    } else {
      return res.REST.NOTFOUND(0, "Project Not Found");
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const id = req.params.id;
    let userId = req.userId;
    let options = {
      where: {
        id: id,
        deleted: 0,
      },
    };
    const response = await getAllProjectById(options);
    if (response) {
      actionLogOption = await CommonService.actionLogs(
        "projects",
        response.id,
        UPDATE,
        actionLogOption,
        req?.userId,
        userId,
        req.connection.remoteAddress
      );
      await response.update(
        { deleted: 1, updatedBy: req.userId },
        actionLogOption
      );
      let actionLogOption = {
        id: req?.userId,
      };

      return res.REST.SUCCESS(1, "Project Deletion Successfully", response);
    } else {
      return res.REST.NOT(0, "Record Not Found");
    }
  } catch (error) {
    await CommonService.filterError(error, req, res);
  }
};
