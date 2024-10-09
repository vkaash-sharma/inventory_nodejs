const models = require('../models/index')
const { Sequelize } = require('sequelize');
const sequelize = require('sequelize');
const { Op } = require("sequelize");

//<====save new company data===>
exports.saveNewCompany = async (data) => {
  try {
    const company = await models.companies.create({
         name : data.name ,
         shortName : data.shortName ,
         logo : data.logo  ,
         createdBy : data.createdBy
    },{raw : true})
    return company
  } catch(error) {
    console.log('Error in getting companies all data : ',error)
  } 
}

//<=====get all company function======>
exports.getAllCompaniesFn = async(options ,excludedItems) => {
    try {
        const companyData = await models.companies.findAll({
            ...options ,
            attributes : {
                exclude : excludedItems || ["createdAt", "updatedAt", "deleted"]
            }
          })
          return companyData
    }catch(error) {
        console.log('Error in getting companies all data : ',error)
    }
     
}


// <=====Get Company by id Function=============>
exports.getCompanyByIdFn = async(options ,excludedItems) => {
    try {
        const companyData = await models.companies.findOne({
            ...options ,
            attributes : {
                exclude : excludedItems || ["createdAt", "updatedAt", "deleted"]
            }
          })
         
          return companyData ? companyData : 0;
    }catch(error) {
        console.log('Error in getting companies all data : ',error)
    }
     
}



// <================Truncate and Copy Data ===============>
exports.truncateAndCopyData = async () =>  {
  // Define raw SQL queries
  const truncateQuery = 'TRUNCATE TABLE user_companies_access_temps';
  const copyQuery = `
    INSERT INTO user_companies_access_temps (userId, companyId, userRole , createdBy)
    SELECT userId, companyId, 'admin' , userId
    FROM company_admins WHERE deleted = 0
  `;

  try {
    // Truncate the user_companies_access_temp table
    await models.user_companies_access_temps.sequelize.query(truncateQuery, { type: Sequelize.QueryTypes.RAW });

    // Copy data from company to user_companies_access_temp and set user_role to 'admin'
    await models.user_companies_access_temps.sequelize.query(copyQuery, { type: Sequelize.QueryTypes.RAW });

    console.log('Data copied successfully with user role set to admin.');



    // <==========handle for the meeting participants====>
    // <============fetch all meeting participants============>
      const participants = await models.meeting_participants.findAll({
        where: { deleted: 0 },
        attributes: [
          'userId',
          'roleInMeeting',
          [sequelize.col('meetingDetails.companyId'), 'companyId']
        ],
        include: [
          {
            association: 'meetingDetails',
            attributes: [], // Exclude additional attributes
            where: { deleted: 0 }
          }
        ]
      });
  
      // Extract userId, companyId, and roleInMeeting
      const uniqueRecordsSet = new Set();
      const recordsToInsert = [];
  
      participants.forEach(participant => {
        const userId = participant.dataValues.userId;
        const companyId = participant.dataValues.companyId;
        const uniqueKey = `${userId}-${companyId}`;
  
        // Check if this combination is already in the set
        if (!uniqueRecordsSet.has(uniqueKey)) {
          uniqueRecordsSet.add(uniqueKey);
          recordsToInsert.push({
            userId: userId,
            companyId: companyId,
            userRole: 'User' 
          });
        }
      });
      
  
      if (recordsToInsert.length === 0) {
        console.log('No records to process.');
        return;
      }
  
      // Step 2: Find existing records in user_companies_access_temp
      const existingRecords = await models.user_companies_access_temps.findAll({
        where: {
          deleted : 0 , 
          [Op.or]: recordsToInsert.map(record => ({
            [Op.and]: [
              { userId: record.userId },
              { companyId: record.companyId }
            ]
          }))
        }
      });
  
      const existingRecordsSet = new Set(
        existingRecords.map(record => `${record.userId}-${record.companyId}`)
      );
  
      const newRecords = recordsToInsert.filter(
        record => !existingRecordsSet.has(`${record.userId}-${record.companyId}`)
      );
  
      if (newRecords.length > 0) {
        await models.user_companies_access_temps.bulkCreate(newRecords);
        console.log('New records inserted successfully.');
      } else {
        console.log('All records are already up-to-date.');
      }

  } catch (error) {
    console.error('Error occurred:', error);
  }
}


