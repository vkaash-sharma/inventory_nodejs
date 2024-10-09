const express = require('express');
const meetingFAQsRouter = express.Router()
const {isAuth} = require('../middleware/jwt_auth');
const apiValidator = require('../middleware/validatorMiddleWare');
const meetingFAQsController = require('../controllers/meetingFaqs.controller')


// ALL
meetingFAQsRouter.get('/all' , isAuth , meetingFAQsController.getAllFaqs);
// GET BY ID
meetingFAQsRouter.get('/faq/:id' , isAuth , meetingFAQsController.getFAQsById);
// CREATE
meetingFAQsRouter.post('/create' , isAuth , meetingFAQsController.createFAQs);
// EDIT
meetingFAQsRouter.put('/edit/:id' , isAuth , meetingFAQsController.editFAQs);

// chatgpt response for FAQ ========>
meetingFAQsRouter.post('/create-faq/:id' , isAuth , meetingFAQsController.generateFAQsAnswer);

// sync the chat status =========>
meetingFAQsRouter.get('/sync/:id' , isAuth , meetingFAQsController.syncChatgptStatus)





module.exports = meetingFAQsRouter;
