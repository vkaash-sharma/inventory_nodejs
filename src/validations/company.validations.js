const Joi = require('joi');

// Define the Joi schema
const postCompanyValidation = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255) // Optional, adjust the max length as needed
    .required(),

  shortName: Joi.string()
    .min(1)
    .max(50) // Optional, adjust the max length as needed
    .required(),

  logo: Joi.string()
    .required(),

  companyAdmins: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1) // Ensures at least one value is present in the array
    .required()
});

module.exports ={postCompanyValidation}