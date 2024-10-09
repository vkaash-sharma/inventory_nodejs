const models = require("../models/index");


// <============ GET ALL FAQs ====================>
exports.getAllFAQsFn = async (options) => {
   try {
    let resp = await models.meeting_faqs.findAll(options);
    return resp;
   }catch(error) {
    console.log("Error on  meeting FAQS errors", error);
   } 
}


// <================= get faq by its ids ============>
exports.getFAQsByIdFn = async (option) => {
    try {
        let resp = await models.meeting_faqs.findOne(option);
        return resp;
    }catch(error) {
       console.log("Error on  meeting FAQS errors", error);
    }
}


// <============create faqs =================>
exports.saveFAQsFn = async (data) => {  
    try {
        let resp = await models.meeting_faqs.create({
            meeting_id : data.meeting_id ,
            question : data.question ,
            answer_type : data.answer_type ,
            answer_text : data.answer_text ,
            createdBy : data.createdBy
        })

        return resp;
    }catch(error) {
       console.log("Error on  create meeting FAQS errors", error);
    }
}    