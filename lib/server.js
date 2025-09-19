// dependencies
import http from 'http';
import handler from '../helper/handleReqRes.js';
import environment from '../helper/environments.js';

const server = {};

// create server
server.createServer = ()=>{
    const serverInstance = http.createServer(handler.handleReqRes);
    serverInstance.listen(environment.httpPort, ()=>{
      console.log(`listening on port ${environment.httpPort} in ${environment.envName} mode`);
    });
}

export default server;