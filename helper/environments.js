// module scaffolding
const environments = {};

// staging (default) environment
environments.staging = {
    httpPort: 3000,
    envName: 'staging',
    hashKey: 'asg&8#gdg654asg#7',
    maxChecks: 5,
};

// production environment
environments.production = {
    httpPort: 5000,
    envName: 'production',
    hashKey: 'asg&8#gdg654asg#7',
    maxChecks: 5,
};

// determine passed environment
const passedEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

// export the module
// export default environments[passedEnvironment]; // not safe
const environmentToExport = typeof(environments[passedEnvironment]) === 'object' ? environments[passedEnvironment] : environments.staging;
export default environmentToExport;
