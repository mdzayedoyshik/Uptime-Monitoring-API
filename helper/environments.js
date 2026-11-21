// module scaffolding
const environments = {};

// secrets come from the process environment, never from source
const twilio = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromPhone: process.env.TWILIO_FROM_PHONE,
};
const hashKey = process.env.HASH_KEY || 'dev-only-hash-key';

// staging (default) environment
environments.staging = {
    httpPort: 3000,
    envName: 'staging',
    hashKey,
    maxChecks: 5,
    twilio,
};

// production environment
environments.production = {
    httpPort: 5000,
    envName: 'production',
    hashKey,
    maxChecks: 5,
    twilio,
};

// determine passed environment
const passedEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

// export the module
// export default environments[passedEnvironment]; // not safe
const environmentToExport = typeof(environments[passedEnvironment]) === 'object' ? environments[passedEnvironment] : environments.staging;
export default environmentToExport;
