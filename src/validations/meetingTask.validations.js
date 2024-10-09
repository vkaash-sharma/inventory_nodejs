const Joi = require('joi');
const postMeetingTaskSchema = Joi.array().items(
  Joi.object({
      meeting_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      meeting_description: Joi.string().min(1).required(),
      meetingDueDate: Joi.date().iso().required(),
      user_count: Joi.number().integer().min(0).required(),
      taskOwners: Joi.array().items(
          Joi.object({
              userId: Joi.number().integer(),
              status: Joi.string().valid('Open', 'Closed', 'Pending').required(),
          }).unknown(true) // Allows any additional keys
      ).required(), // The array itself is required, but it can be empty
      deleted: Joi.number().integer().valid(0, 1) // Optional, if present
  }).unknown(true)
);




  module.exports ={postMeetingTaskSchema}