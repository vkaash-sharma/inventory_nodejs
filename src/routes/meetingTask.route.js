
const express = require('express');
const meetingTaskRouter = express.Router()
const meetingTaskController = require("../controllers/meetingTaskController.controller");
const {isAuth} = require('../middleware/jwt_auth');
const apiValidator = require('../middleware/validatorMiddleWare');
const { postMeetingTaskSchema } = require('../validations/meetingTask.validations');


meetingTaskRouter.get('/getAllTask/:id' , isAuth , meetingTaskController.getAllTaskByMeetingId);

meetingTaskRouter.post('/create' , isAuth   , meetingTaskController.addEditTask)





module.exports = meetingTaskRouter;
