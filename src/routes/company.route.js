const express = require('express');
const companyRouter = express.Router()
const companyController = require("../controllers/company.controller");
const {isAuth} = require('../middleware/jwt_auth');
const apiValidator = require('../middleware/validatorMiddleWare');
const { postCompanyValidation } = require('../validations/company.validations');

// get all companies data===>
companyRouter.get('/all-companies' ,isAuth , companyController.getAllcompanies);


// get company by id===>
companyRouter.get('/company-by-id/:id' , isAuth , companyController.getCompanyById);

// post company ====>
companyRouter.post('/create' , isAuth ,apiValidator(postCompanyValidation) , companyController.postCompany);

// edit company =====>
companyRouter.put('/update/:id' , isAuth ,apiValidator(postCompanyValidation) , companyController.EditCompany);


// delete company =====>
companyRouter.delete('/delete/:id' , isAuth ,apiValidator(postCompanyValidation) , companyController.deleteCompany);



module.exports = companyRouter;
