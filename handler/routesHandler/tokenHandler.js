// dependencies
import utilites from "../../helper/utilities.js";
import data from "../../lib/data.js";


// module scaffolding
const handler = {};

// token handler
handler.tokenHandler = (requestProperties, callback)=> {
    const acceptedMethods = ["GET", "POST", "PUT", "DELETE"];
    if(acceptedMethods.indexOf(requestProperties.method) > -1){
        handler._token[requestProperties.method](requestProperties, callback);
    }else{
        callback(405, {
            'success': false,
            'message': 'method not allowed',
        });
    }
};

handler._token = {};

handler._token.POST = (requestProperties, callback)=>{
    const phone = typeof(requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length > 0 ? requestProperties.body.phone.trim() : false;

    const password = typeof(requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;

    if(password && phone){
        data.read("users", phone, (err1, userData)=>{
            if(err1){
                callback(404, {
                    'success': false,
                    'message': 'the user not found',
                });
            }else{
                const hashedPass = utilites.hash(password);
                if(hashedPass === userData.password){
                    const tokenId = utilites.createRandomString(32);
                    const expires = Date.now() + 1000 * 60 * 60; // 1 hour from now
                    const tokenObject = {
                        phone,
                        "id": tokenId,
                        expires
                    };

                    data.create("tokens", tokenId, tokenObject, (err2)=>{
                        if(!err2){
                            callback(200, {
                                'success': true,
                                'message': 'the token created successfully',
                            });
                        }else{
                            callback(500, {
                                'success': false,
                                'message': 'there was an error in creating the token',
                            });
                        }
                    });
                }else{
                    callback(400, {
                        'success': false,
                        'message': 'password is not correct',
                    });
                }
            }
        });
    }else{
        callback(400, {
            'success': false,
            'message': 'phone number or password is not valid',
        });
    }
};

handler._token.GET = (requestProperties, callback)=>{
    const id = typeof(requestProperties.query.id) === 'string' && requestProperties.query.id.trim().length > 0 ? requestProperties.query.id.trim() : false;

    if(id){
        // look for the file
        data.read("tokens", id, (err1, tokenData)=>{
            if(!err1 && tokenData){
                callback(200, {
                    'success': true,
                    'data': tokenData,
                });
            }else{
                callback(404, {
                    'success': false,
                    'message': 'the token not found',
                });
            }
        });
    }else{
        callback(400, {
            'success': false,
            'message': 'The request was a legal request, but the server is refusing to respond to it',
        });
    }
};

handler._token.PUT = (requestProperties, callback)=>{
    const id = typeof(requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length > 0 ? requestProperties.body.id.trim() : false;

    const extend = typeof(requestProperties.body.extend) === 'boolean' && requestProperties.body.extend === true ? true : false;

    if(id && extend){
        //look for the tokenData
        data.read("tokens", id, (err1, tokenData)=>{
            if(!err1 && tokenData){
                if(tokenData.expires > Date.now()){
                    tokenData.expires = Date.now() + 1000 * 60 * 60; // 1 hour from now
                    // update the file
                    data.update("tokens", id, tokenData, (err2)=>{
                        if(!err2){
                            callback(200, {
                                'success': true,
                                'message': 'the token updated successfully',
                            });
                        }else{
                            callback(500, {
                                'success': false,
                                'message': 'there was an error in updating the token',
                            });
                        }
                    });
                }else{
                    callback(400, {
                        'success': false,
                        'message': 'the token has expired',
                    });
                }
            }else{
                callback(404, {
                    'success': false,
                    'message': 'the token not found',
                });
            }
        });
    }else{
        callback(400, {
            'success': false,
            'message': 'The request was a legal request, but the server is refusing to respond to it',
        });
    }
};

handler._token.DELETE = (requestProperties, callback)=>{
    const id = typeof(requestProperties.query.id) === 'string' && requestProperties.query.id.trim().length > 0 ? requestProperties.query.id.trim() : false;

    if(id){
        // look for the file
        data.read("tokens", id, (err1, tokenData)=>{
            if(!err1 && tokenData){
                // delete the file
                data.delete("tokens", id, (err2)=>{
                    if(!err2){
                        callback(200, {
                            'success': true,
                            'message': 'the token deleted successfully',
                        });
                    }else{
                        callback(500, {
                            'success': false,
                            'message': 'there was an error in deleting the token',
                        });
                    }
                });
            }else{
                callback(404, {
                    'success': false,
                    'message': 'the token not found',
                });
            }
        });
    }else{
        callback(400, {
            'success': false,
            'message': 'The request was a legal request, but the server is refusing to respond to it',
        });
    }
};

handler._token.verify = (token, phone, callback)=>{
    data.read("tokens", token, (err1, tokenData)=>{
        if(!err1 && tokenData){
            if(tokenData.phone === phone && tokenData.expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    });
}

export default handler;