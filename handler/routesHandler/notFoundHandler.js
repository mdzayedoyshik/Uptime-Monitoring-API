// dependencies

// module scaffolding
const handler = {};

// sample handler
handler.notFoundHandler = (requestProperties, callback)=> {
    callback(404, {
        'success': false,
        'message': 'Cannot find the requested resource',
    });
};

export default handler;