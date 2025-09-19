// dependecies
import sampleHandler from './handler/routesHandler/sampleHandler.js';
import userHandler from './handler/routesHandler/userHandler.js';
import tokenHandler from './handler/routesHandler/tokenHandler.js';
import checkHandler from './handler/routesHandler/checkHandler.js';

// routes handler
const routes = {
    sample: sampleHandler.sampleHandler,
    user: userHandler.userHandler,
    token: tokenHandler.tokenHandler,
    check: checkHandler.checkHandler
};

export default routes;