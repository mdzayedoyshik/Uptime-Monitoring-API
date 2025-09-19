// dependencies

// module scaffolding
const handler = {};

// sample handler
handler.sampleHandler = (requestProperties, callback)=> {
    callback(200, {
        'success': true,
        'message': 'the sample data received successfully',
    });
};

export default handler;