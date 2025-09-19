// dependencies
import server from './lib/server.js';
import worker from './lib/worker.js';

const app = {};

app.init = ()=>{
  // start the server
  server.createServer();
  // start the worker
  worker.createWorker();
}

app.init();

export default app;