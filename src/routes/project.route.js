const express = require('express');
const ProjectRouter = express.Router()
const {isAuth} = require('../middleware/jwt_auth');
const apiValidator = require('../middleware/validatorMiddleWare');
const projectController = require('../controllers/project.controller');
const { postProjectValidation, editProjectValidation } = require('../validations/project.validations');

// get all projects
ProjectRouter.get('/all-projects' , isAuth , projectController.getAllProjects)

// get all projects by companyId====>
ProjectRouter.get('/all-projects-companyId/:id' , isAuth , projectController.getAllProjectsByCompanyId);


// get project by ids======>
ProjectRouter.get('/project-by-id/:id' , isAuth , projectController.getProjectById )

// create new projects====>
ProjectRouter.post('/create' , isAuth ,apiValidator(postProjectValidation) , projectController.createNewProjects) ;


// edit project==========>
ProjectRouter.put('/edit-project/:id' , isAuth,apiValidator(editProjectValidation) , projectController.editProject);    

// delete projects========>
ProjectRouter.delete('/delete/:id' , isAuth , projectController.deleteProject)









module.exports = ProjectRouter;
