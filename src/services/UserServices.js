const models = require('../models/index')


// getAll users===============>
exports.getAllUsersFn = async(options , excludeItems) => {
    try {
        let response = await models.users.findAll({...options , attributes :{exclude : excludeItems   ? excludeItems :  ["createdAt" , "updatedAt" , "deleted"]}});
        return response;
    }catch(error) {
        console.log('Error in getting single user by email : ',error)
    }
}

exports.getAllUsersFnRowsAndCount = async(options , excludeItems) => {
    try {
        let {count , rows} = await models.users.findAndCountAll({...options , attributes :{exclude : excludeItems   ? excludeItems :  ["createdAt" , "updatedAt" , "deleted"]}});
    
        return {count , rows};
    }catch(error) {
        console.log('Error in getting single user by email : ',error)
    }
}

// check the change password validation ==========>
exports.changePasswordValidation = (oldPassword, password, confirmPassword) => {

    if (!oldPassword || !password || !confirmPassword) {
        return {
            status: 0,
            message: "All fields are required."
        };
    }
    if (oldPassword === password || password !== confirmPassword) {
        if (oldPassword === password) {
            return {
                status: 0,
                message: "New password cannot be the same as the old password."
            }
        }
        if (password !== confirmPassword) {
            return {
                status: 0,
                message: "Password and confirm password do not match."
            }
        }
    }
    return {
        status: 1,
        message: "success"
    }

}

exports.getSingleUserByEmail =async (email )=>{

    try {
        const excludedItems = ['password']
        
        const user = await models.users.findOne({
            where: { email: email , deleted : 0} , attributes : { exclude: excludedItems ? excludedItems : ['password', 'verification_token'] }
        })
    
        return user ;

    } catch (error) {
        console.log('Error in getting single user by email : ',error)
    }

   
}

exports.getSingleUserByID =async (options , excludeItems)=>{

    try {
        
      let response = await models.users.findOne({...options , attributes :{exclude : excludeItems   ? excludeItems :  ["createdAt" , "updatedAt" , "deleted"]}})
       return response
    } catch (error) {
        console.log('Error in getting single user by id : ',error)
    }
}

exports.getSingleUser =async (userId , excludedItems)=>{

    try {
        
        const user = await models.users.findByPk(userId , {
            attributes: { exclude: excludedItems ? excludedItems : ['password', 'verification_token'] }
        })
    
        return user ;

    } catch (error) {
        console.log('Error in getting single user by id : ',error)
    }
}

// <=============SAVE NEW USER==================>
exports.saveNewUser =async (data)=>{

    try {
        
        const user = await models.users.create({
            firstName: data.firstName,
            lastName : data.lastName ,
            email: data.email,
            mobile: data.mobile,
            password: data.hashedPassword,
            isInvited : data.isInvited ,
            invitedBy : data.invitedBy ,
            isRegisterationCompleted : data.isRegisterationCompleted ,
            emaiVerifiedAt : data.emailVerifiedAt ,
            isActive : data?.isActive
        } , {raw : true});
    
        return user.dataValues ;

    } catch (error) {
        console.log('Error in creating new user : ',error);
    }
}
// <=================UPDATE USER =======================>
exports.updateUser =async (updatedFields , userId , actionLogId )=>{
    try {
        const user = await models.users.update(updatedFields, {where : {id : userId} , returning: true });
        return user ;
    } catch (error) {
        console.log('Error in updating user : ',error)
    }

}
// <====================SAVE USER ROLE ========================>
exports.saveUserRole = async(data)=> {
    try {
       const userRole = await models.user_roles.create({
        userId : data.userId,
        roleId : data.roleId ,
        createdBy : data.userId
       },{raw : true})

       return userRole
    }catch(error) {
        console.log('Error in updating user : ',error)
    }
}
