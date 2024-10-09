const express = require('express');
const meetingRouter = express.Router()
const meetingController = require("../controllers/meetings.controller");
const meetingDocument = require('../controllers/meetingDocument.controller')
const {isAuth} = require('../middleware/jwt_auth');
const apiValidator = require('../middleware/validatorMiddleWare');
const { postMeetingSchema, editMeetingSchema } = require('../validations/meetings.validations');



//  Get All meetings ======>
meetingRouter.get('/all-meetings' , isAuth , meetingController.getAllMeetings);

//  get meeting by companyId ====>
meetingRouter.get('/meeting-by-companyId' , isAuth , meetingController.getMeetingBasedonCompanyId);


// get meeting by id =======>
meetingRouter.get('/meeting-by-id/:id' , isAuth , meetingController.getMeetingById)  

// get meeting for the meeting users===>
meetingRouter.get('/all-user-meetings/:id' , isAuth , meetingController.getUserMeetingBasedOnCompanyId)    


// get all meeting documents ==============>
meetingRouter.get('/all-documents/:id' , isAuth , meetingDocument.getAllMeetingDocs)    


//  Create new meetings =======>
meetingRouter.post('/create' , isAuth , apiValidator(postMeetingSchema) , meetingController.createNewMeetings);

//  Edit Meetings ======>
meetingRouter.put('/edit/:id' , isAuth , apiValidator(editMeetingSchema)  , meetingController.editNewMeetings )  ;

// suggested Meeting Users======>
meetingRouter.get('/suggestedUser/:id' , isAuth , meetingController.suggestedUserInMeeting)    

//  delete Meetings ====>
meetingRouter.delete('/delete/:id' , isAuth , meetingController.deleteMeetings)    




module.exports = meetingRouter;
