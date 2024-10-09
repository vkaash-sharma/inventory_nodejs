const Joi = require('joi');

// Define the Joi schema

const postProjectValidation = Joi.object({
  projectName: Joi.string() // Validate projectName as a string
    .min(1) // Minimum length of 1
    .required(), // Required field

  companyId: Joi.string() // Validate companyId as a string
    .min(1) // Minimum length of 1
    .required(), // Required field
});



const editProjectValidation = Joi.object({
  projectName: Joi.string() // Validate projectName as a string
    .min(1) // Minimum length of 1
    .required(), // Required field

  companyId: Joi.string() // Validate companyId as a string
    .min(1) // Minimum length of 1
    .required(), // Required field
   
  });

module.exports ={postProjectValidation , editProjectValidation}