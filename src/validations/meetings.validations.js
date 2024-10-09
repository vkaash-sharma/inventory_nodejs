const Joi = require('joi');


const postMeetingSchema = Joi.object({
    companyId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    projectId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    meetingTitle: Joi.string().min(1).required(),
    startTime: Joi.date().allow(null),
    endTime: Joi.date().allow(null),
    meeting_participants: Joi.array()
        .items(Joi.object({
            userId: Joi.number().integer().positive(), // Make userId required if necessary
            roleInMeeting: Joi.string().required(), // Make roleInMeeting required
            email: Joi.string().email().allow(''), // Validate as email if needed
            name: Joi.string().allow('') // Allow empty names if needed
        }).unknown(true))
        .min(1) // Ensure the array has at least one item
        .required(),
    meeting_documents: Joi.array().items(Joi.object()).required() // Assuming each document is an object, adjust as needed
}).unknown(true);

module.exports = postMeetingSchema;


const editMeetingSchema = Joi.object({
    companyId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    projectId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    meetingTitle: Joi.string().min(1).required(),
    startTime: Joi.date().allow(null),
    endTime: Joi.date().allow(null),
    meeting_participants: Joi.array()
        .items(Joi.object({
            roleInMeeting: Joi.string().required(), // Assuming roleInMeeting is required
            email: Joi.string().email().allow(''), // Optional: Validate email if needed
            name: Joi.string().allow('') // Optional: Allow empty names if needed
        }).unknown(true))
        .min(1) // Ensure the array has at least one item
        .required(),
    meeting_documents: Joi.array()
        .items(Joi.object()) // Adjust based on the expected structure of each document
        .required()
}).unknown(true);

module.exports = editMeetingSchema;




  module.exports ={postMeetingSchema , editMeetingSchema}