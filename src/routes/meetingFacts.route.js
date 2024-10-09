const express = require('express');
const meetingFactsRouter = express.Router()
const {isAuth} = require('../middleware/jwt_auth');
const apiValidator = require('../middleware/validatorMiddleWare');
const meetingFactsController = require('../controllers/meetingsFacts.controller')


// ALL
meetingFactsRouter.put('/speaker-details/:id' , isAuth , meetingFactsController.updateSuggestedSpeakers)





module.exports = meetingFactsRouter;
