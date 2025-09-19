// dependencies
import url from 'url';
import { StringDecoder } from 'string_decoder';
import routes  from '../routes.js';
import nfHandler from '../handler/routesHandler/notFoundHandler.js'
import utilites from '../helper/utilities.js';

// module scaffolding
const handler = {};

// handle request response
handler.handleReqRes = (req, res) => {
  
  const parsedUrl = url.parse(req.url, true);
  const trimmedPath = parsedUrl.pathname.split('/').filter(Boolean).join('/');
  const query = parsedUrl.query;
  const method = req.method;
  const header = req.headers;
  
  const requestProperties = {
    parsedUrl,
    trimmedPath,
    query,
    method,
    header,
  };

  const decoder = new StringDecoder('utf-8');
  let decodedData = '';
  req.on('data', (buffer)=>{
    decodedData += decoder.write(buffer);
  });
  req.on('end', ()=>{
    decodedData += decoder.end();
    requestProperties.body = utilites.parseJSON(decodedData);    
    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : nfHandler.notFoundHandler;
    chosenHandler(requestProperties, (statusCode, payload) => {
        statusCode = typeof statusCode === 'number' ? statusCode : 500;
        payload = typeof payload === 'object' ? payload : {};
        const payloadString = JSON.stringify(payload);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
    });
  });
};

export default handler;