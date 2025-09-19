// dependencies
import utilites from "../../helper/utilities.js";
import data from "../../lib/data.js";
import tokenHandler from "./tokenHandler.js";
import environment from "../../helper/environments.js";

// module scaffolding
const handler = {};

// user handler
handler.checkHandler = (requestProperties, callback)=> {
    const acceptedMethods = ["GET", "POST", "PUT", "DELETE"];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._check[requestProperties.method](requestProperties, callback);
    }else{
        callback(405, {
            'success': false,
            'message': 'method not allowed',
        });
    }
};

handler._check = {};

handler._check.GET = (requestProperties, callback)=>{
    const id = typeof(requestProperties.query.id) === 'string' && requestProperties.query.id.trim().length > 0 ? requestProperties.query.id.trim() : false;

    if(id){
        data.read("checks", id, (err1, checkData)=>{
           if(!err1 && checkData){
                const phone = checkData.phone;
                const token = typeof(requestProperties.header.token) === 'string' ? requestProperties.header.token : false;
                tokenHandler._token.verify(token, phone, (tokenIsValid)=>{
                    if(tokenIsValid){
                        callback(200, {
                            'success': true,
                            'data': checkData,
                        });
                    }else{
                        callback(403, {
                            'success': false,
                            'message': 'unauthorized access',
                        });
                    }
                })
           }else{
                callback(404, {
                    'success': false,
                    'message': 'the check not found',
                });
           } 
        });
    }else{
        callback(400, {
            'success': false,
            'message': 'Please pass an id',
        });
    }
};

handler._check.POST = (requestProperties, callback)=>{
    // protocol
    const protocol = typeof(requestProperties.body.protocol) === 'string' && requestProperties.body.protocol.trim().length > 0 && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol.trim() : false;
    // url
    const url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url.trim() : false;
    // method
    const method = typeof(requestProperties.body.method) === 'string' && requestProperties.body.method.trim().length > 0 && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method.trim() : false;
    // successCodes
    const successCodes = typeof(requestProperties.body.success_codes) === 'object' && requestProperties.body.success_codes instanceof Array ? requestProperties.body.success_codes : false;
    // timeoutSeconds
    const timeoutSeconds = typeof(requestProperties.body.timeout_seconds) === 'number' && requestProperties.body.timeout_seconds > 0 && requestProperties.body.timeout_seconds < 5 && requestProperties.body.timeout_seconds % 1 === 0 ? requestProperties.body.timeout_seconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        const token = typeof(requestProperties.header.token) === 'string' ? requestProperties.header.token : false;

        data.read("tokens", token, (err1, tokenData)=>{
            if(!err1 && tokenData){
                const userPhone = tokenData.phone;
                tokenHandler._token.verify(token, userPhone, (isValid)=>{
                    if(isValid){
                        data.read("users", userPhone, (err2, userData)=>{
                            if(!err2 && userData){
                                let currentChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                                if(currentChecks.length < environment.maxChecks){
                                    const id = utilites.createRandomString(4);
                                    const checkObject = {
                                        id,
                                        'phone': userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    data.create("checks", id, checkObject, (err3)=>{
                                        if(!err3){
                                            userData.checks = currentChecks;
                                            userData.checks.push(id);
                                            data.update("users", userPhone, userData, (err4)=>{
                                                if(!err4){
                                                    callback(200, {
                                                        'success': true,
                                                        'message': 'check created successfully',
                                                        'data': checkObject
                                                    });
                                                }else{
                                                    callback(500, {
                                                        'success': false,
                                                        'message': 'there was an error in updating the user data',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                'success': false,
                                                'message': 'there was an error in creating the check',
                                            });
                                        }
                                    });
                                }else{
                                    callback(429, {
                                        'success': false,
                                        'message': 'user has reached their check limit',
                                    });
                                    return;
                                }
                            }else{
                                callback(500, {
                                    'success': false,
                                    'message': 'there was an error in reading the user data',
                                });
                            }
                        });
                    }else{
                        callback(403, {
                            'success': false,
                            'message': 'token is not valid',
                        });
                    }
                })
            }else{
                callback(403, {
                    'success': false,
                    'message': 'unauthorized access',
                });
            }});
    }else{
        callback(400, {
            'success': false,
            'message': 'missing required fields',
        });
    }
};

handler._check.PUT = (requestProperties, callback)=>{
    const id = typeof(requestProperties.query.id) === 'string' && requestProperties.query.id.trim().length > 0 ? requestProperties.query.id.trim() : false;

    if(id){

        const protocol = typeof(requestProperties.body.protocol) === 'string' && requestProperties.body.protocol.trim().length > 0 && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol.trim() : false;

        const url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url.trim() : false;

        const method = typeof(requestProperties.body.method) === 'string' && requestProperties.body.method.trim().length > 0 && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method.trim() : false;

        const successCodes = typeof(requestProperties.body.success_codes) === 'object' && requestProperties.body.success_codes instanceof Array ? requestProperties.body.success_codes : false;

        const timeoutSeconds = typeof(requestProperties.body.timeout_seconds) === 'number' && requestProperties.body.timeout_seconds > 0 && requestProperties.body.timeout_seconds < 5 && requestProperties.body.timeout_seconds % 1 === 0 ? requestProperties.body.timeout_seconds : false;

        if(protocol || url || method || successCodes || timeoutSeconds){
            const token = typeof(requestProperties.header.token) === 'string' ? requestProperties.header.token : false;

            data.read("tokens", token, (err1, tokenData)=>{
                if(!err1 && tokenData){
                    const userPhone = tokenData.phone;
                    tokenHandler._token.verify(token, userPhone, (isValid)=>{
                       if(isValid){
                            data.read("checks", id, (err2, checkData)=>{
                                if(!err2 && checkData){
                                    if(checkData.phone === userPhone){
                                        const checkObject = checkData;
                                        if(protocol) checkObject.protocol = protocol;
                                        if(url) checkObject.url = url;
                                        if(method) checkObject.method = method;
                                        if(successCodes) checkObject.successCodes = successCodes;
                                        if(timeoutSeconds) checkObject.timeoutSeconds = timeoutSeconds;
                                        data.update("checks", id, checkObject, (err3)=>{
                                            if(!err3){
                                                callback(200, {
                                                    'success': true,
                                                    'message': 'the check updated successfully',
                                                    'data': checkObject,
                                                });
                                            }else{
                                                callback(500, {
                                                    'success': false,
                                                    'message': 'there was an error in updating the check',
                                                });
                                            }
                                        });
                                    }else{
                                        callback(403, {
                                            'success': false,
                                            'message': 'unauthorized access',
                                        });
                                        return;
                                    }
                                }else{
                                    callback(404, {
                                        'success': false,
                                        'message': 'the check not found',
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
            });
        }else{
            callback(400, {
                'success': false,
                'message': 'missing required fields',
            });
        }

    }else{
        callback(400, {
            'success': false,
            'message': 'Please pass an id',
        });
    }
};

handler._check.DELETE = (requestProperties, callback)=>{
    const id = typeof(requestProperties.query.id) === 'string' && requestProperties.query.id.trim().length > 0 ? requestProperties.query.id.trim() : false;

    if(id){
        data.read("checks", id, (err1, checkData)=>{
            if(!err1 && checkData){
                const token = typeof(requestProperties.header.token) === 'string' ? requestProperties.header.token : false;
                if(token){
                    tokenHandler._token.verify(token, checkData.phone, (isValid)=>{
                        if(isValid){
                            data.delete("checks", id, (err2)=>{
                                if(!err2){
                                    // delete from user
                                    data.read("users", checkData.phone, (err3, userData)=>{
                                       if(!err3 && userData){
                                            const userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                                            const checkPosition = userChecks.indexOf(id);
                                            if(checkPosition > -1){
                                                userChecks.splice(checkPosition, 1);
                                                userData.checks = userChecks;
                                                data.update("users", checkData.phone, userData, (err4)=>{
                                                    if(!err4){
                                                        callback(200, {
                                                            'success': true,
                                                            'message': 'the check deleted successfully',
                                                        });
                                                    }else{
                                                        callback(500, {
                                                            'success': false,
                                                            'message': 'there was an error in deleting the check from user',
                                                        });
                                                    }
                                                });
                                            }else{
                                                callback(500, {
                                                    'success': false,
                                                    'message': 'there was an error in deleting the check from user',
                                                });
                                            }
                                       }else{

                                       } 
                                    });
                                }else{
                                    callback(500, {
                                        'success': false,
                                        'message': 'there was an error in deleting the check',
                                    });
                                }
                            });
                        }else{
                            callback(403, {
                                'success': false,
                                'message': 'unauthorized access',
                            });
                        }
                    })
                }else{
                    callback(403, {
                        'success': false,
                        'message': 'unauthorized access',
                    });
                }
            }else{
                callback(404, {
                    'success': false,
                    'message': 'the check not found',
                });
            }
        });
    }else{
        callback(400, {
            'success': false,
            'message': 'Please pass an id',
        });
    }
};

export default handler;