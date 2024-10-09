const api = require('express')();
const AuthRouter = require('./auth.route');
const actionLogRouter = require('./actionChangeLog.route')
const UserRouter = require('./user.route');
const UploadFile = require('./upload.route');
const notifyRouter = require('./notification.route');
const companyRouter = require('./company.route') ;
const projectRouter = require('./project.route') ;
const meetingRouter = require('./meeting.route');
const meetingTaskRouter = require('./meetingTask.route');
const meetingFaqsRouter= require('./meetingFaqs.route')
const meetingDocumentFacts = require('./meetingFacts.route');

api.get("/", (req, res) => {
    res.send('Hello Node Server🌎 is Working Fine here...');
})
api.use('/user', UserRouter);
api.use('/auth', AuthRouter);
api.use('/upload', UploadFile);
api.use('/companies' , companyRouter);
api.use('/projects' , projectRouter )
api.use('/notification', notifyRouter);
api.use('/meetings' , meetingRouter)
api.use('/meetingTask' , meetingTaskRouter);
api.use('/meetingFAQs' , meetingFaqsRouter);
api.use('/meetingdoc-facts' , meetingDocumentFacts);
api.use('/actions' , actionLogRouter)

module.exports = api