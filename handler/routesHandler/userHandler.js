// dependencies
import utilites from "../../helper/utilities.js";
import data from "../../lib/data.js";
import tokenHandler from "./tokenHandler.js";


// module scaffolding
const handler = {};

// user handler
handler.userHandler = (requestProperties, callback)=> {
    const acceptedMethods = ["GET", "POST", "PUT", "DELETE"];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._user[requestProperties.method](requestProperties, callback);
    }else{
        callback(405, {
            'success': false,
            'message': 'method not allowed',
        });
    }
};

handler._user = {};

handler._user.GET = (requestProperties, callback)=>{
    const phone = typeof(requestProperties.query.phone) === 'string' && requestProperties.query.phone.trim().length > 0 ? requestProperties.query.phone.trim() : false;  

    if(phone){
        data.read("users", phone, (err, u)=>{
            const user = {...u};
            delete user.password;
            if(!err && user){;
                const token = typeof(requestProperties.header.token) === 'string' ? requestProperties.header.token : false;
                if(token){
                    tokenHandler._token.verify(token, phone, (isValid)=>{
                        if(isValid){
                            delete user.password;
                            callback(200, {
                                'success': true,
                                'data': user,
                            });
                        }else{
                            callback(403, {
                                'success': false,
                                'message': 'unauthorized access',
                            });
                        }
                    });
                }
            }else{
                callback(404, {
                    'success': false,
                    'message': 'the user not found',
                });
            }
        });
    }else{
        callback(400, {
            'success': false,
            'message': 'phone number is not valid',
        });
    }
};

handler._user.POST = (requestProperties, callback)=>{
    const firstName = typeof(requestProperties.body.first_name) === 'string' && requestProperties.body.first_name.trim().length > 0 ? requestProperties.body.first_name.trim() : false;

    const lastName = typeof(requestProperties.body.last_name) === 'string' && requestProperties.body.last_name.trim().length > 0 ? requestProperties.body.last_name.trim() : false;

    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length > 0 ? requestProperties.body.phone.trim() : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;

    if(firstName && lastName && phone && password){
        data.read("users", phone, (err1, user)=>{
            if(err1){
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password : utilites.hash(password),
                }
                data.create("users", phone, userObject, (err2)=>{
                    if(!err2){
                        callback(200, {
                            'success': true,
                            'message': 'the user created successfully',
                        });
                    }else{
                        callback(500, {
                            'success': false,
                            'message': 'there was an error in creating the user',
                        });
                    }
                });
            }else{
                callback(400, {
                    'success': false,
                    'message': 'the user already exists',
                });
            }
        });
    }else{
        callback(400, {
            'success': false,
            'message': 'the user data is not valid',
        });
    }
};
handler._user.PUT = (requestProperties, callback)=>{
    // check phone number
    const phone = typeof(requestProperties.query.phone) === 'string' && requestProperties.query.phone.trim().length > 0 ? requestProperties.query.phone.trim() : false;

    const firstName = typeof(requestProperties.body.first_name) === 'string' && requestProperties.body.first_name.trim().length > 0 ? requestProperties.body.first_name.trim() : false;

    const lastName = typeof(requestProperties.body.last_name) === 'string' && requestProperties.body.last_name.trim().length > 0 ? requestProperties.body.last_name.trim() : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;

    if(phone){
        if(firstName || lastName || password){
            // look for the file
            data.read("users", phone, (err1, userData)=>{
                if(!err1 && userData){
                    const token = typeof(requestProperties.header.token) === 'string' ? requestProperties.header.token : false;
                    if(token){
                        tokenHandler._token.verify(token, phone, (isValid)=>{
                            if(isValid){
                                // update the file
                                const userObject = {
                                    firstName : firstName ? firstName : userData.firstName,
                                    lastName : lastName ? lastName : userData.lastName,
                                    password : password ? utilites.hash(password) : userData.password,
                                }
                                data.update("users", phone, userObject, (err2)=>{
                                    if(!err2){
                                        callback(200, {
                                            'success': true,
                                            'message': 'the user updated successfully',
                                        });
                                    }else{
                                        callback(500, {
                                            'success': false,
                                            'message': 'there was an error in updating the user',
                                        });
                                    }
                                });
                            }else{
                                callback(403, {
                                    'success': false,
                                    'message': 'unauthorized access',
                                });
                            }
                        });
                    }else{
                        callback(403, {
                            'success': false,
                            'message': 'unauthorized access',
                        });
                    }
                }else{
                    callback(404, {
                        'success': false,
                        'message': 'the user not found',
                    });
                }
            })
        }else{
            callback(400, {
                'success': false,
                'message': 'the user data is not valid',
            });
        }
    }else{
        callback(400, {
            'success': false,
            'message': 'phone number is not valid',
        });
    }
};
handler._user.DELETE = (requestProperties, callback)=>{
    // check phone number
    const phone = typeof(requestProperties.query.phone) === 'string' && requestProperties.query.phone.trim().length > 0 ? requestProperties.query.phone.trim() : false;

    if(phone){
        // look for the file
        data.read("users", phone, (err1, userData)=>{
            if(!err1 && userData){
                const token = typeof(requestProperties.header.token) === 'string' ? requestProperties.header.token : false;
                if(token){
                    tokenHandler._token.verify(token, phone, (isValid)=>{
                        if(isValid){
                            // delete the file
                            data.delete("users", phone, (err2)=>{
                                if(!err2){
                                    callback(200, {
                                        'success': true,
                                        'message': 'the user deleted successfully',
                                    });
                                }else{
                                    callback(500, {
                                        'success': false,
                                        'message': 'there was an error in deleting the user',
                                    });
                                }
                            });
                        }else{
                            callback(403, {
                                'success': false,
                                'message': 'unauthorized access',
                            });
                        }
                    });
                }else{
                    callback(403, {
                        'success': false,
                        'message': 'unauthorized access',
                    });
                }
            }else{
                callback(404, {
                    'success': false,
                    'message': 'the user not found',
                });
            }
        })
    }else{
        callback(400, {
            'success': false,
            'message': 'phone number is not valid',
        });
    }
};

export default handler;