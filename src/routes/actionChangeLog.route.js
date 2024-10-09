const express = require('express')
const logRouter = express.Router();
const actionLogController = require('../controllers/actionChangeLog.controller')
const {isAuth} = require('../middleware/jwt_auth');
const apiValidator = require('../middleware/validatorMiddleWare');


logRouter.get('/actionLogs/:id' , isAuth , actionLogController.getAllActionLogsDetails);

logRouter.get('/logs/:id' , isAuth , actionLogController.getAllActionLogBasedOnId);






module.exports = logRouter