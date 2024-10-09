const { getMeetingDocFn } = require("../services/meetingDocumentService");


exports.getAllMeetingDocs = async(req , res) => {
    try {
      let id = req.params.id;
      let baseOptions = {
        where : {
            meeting_id : id ,
            deleted : 0
        }
      }
      let resp = await getMeetingDocFn(baseOptions);
      if(resp) {
        return res.send({
            status : 1 ,
            message : "Data Fetch Successfully." ,
            data : resp
        })
      }else{
        return res.send({
            status : 0 ,
            message : "No Record Found" ,
            data : []
        })
      }

    }catch(error) {
        console.log("Error in catch block  : ", error);
        await CommonService.filterError(error, req, res);
    }
}