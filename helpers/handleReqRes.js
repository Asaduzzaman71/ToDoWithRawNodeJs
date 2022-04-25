// dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('./utilities');

// modue scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
    // request handling
    // get the url and parse it
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headersObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        console.log(realData);
        // json to object
        requestProperties.body = parseJSON(realData);
        console.log(requestProperties.body);
        chosenHandler(requestProperties, (statusCode, payload) => {
            const status = typeof statusCode === 'number' ? statusCode : 500;
            const responsePayload = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(responsePayload);

            // return the final response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(status);
            res.end(payloadString);
        });
    });
};

module.exports = handler;
