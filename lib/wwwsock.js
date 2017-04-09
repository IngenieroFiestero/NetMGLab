/**
 * WebSocket Interface with NetMGLab
 */
const WebSocket = require('ws');
const config = reqire('../config.js').ws;
const snmpAgent = require('../models/snmp_agent');
const manager = require('./wwwSock/manager');


module.exports = function (server) {
    const wss = new WebSocket.Server({ server,'verifyClient' : manager.verifyClient });

    wss.on('connection', function connection(ws) {
        const location = url.parse(ws.upgradeReq.url, true);
        // You might use location.query.access_token to authenticate or share sessions
        // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
        });

        ws.send('something');
    });
}