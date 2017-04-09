/*
 * Commands needed by the WebSocket NetMGLab module.
 */
const multiAgent = require('./snmp-multiagent');
const jwt = require('jsonwebtoken');
exports.TYPES = {
    get: 0,//Get element by Id
    getAll: 1,//Get All elements
    update: 2,//Update Db element
    remove: 3,//Remove DB element
    broadcast: 4,//Broadcast Message
    patch: 5//Update elements from server2client
}

/**
 * WebSocket Commands
 * @param {Number} type
 */
function WSCommand(type, body) {
    this.type = type;
    this.body = body;
}

/**
 * Use a request command to search for SNMP Agents. Is provided too the WebSocket connection: ws.
 * The websocket connection inform us about the user privileges and other useful stuff
 * @param {Object} req
 * @param {WebSocket} ws
 * @param {Function} cb
 */
exports.searchSnmpAgent = function searchSnmpAgent(req, ws, cb) {
    
}
/**
 * Verify the client searching for the Auth token in the headers.
 * For the secret use process.jwtSecret
 * @param {Object} info
 * @param {Function} cb
 */
exports.verifyClient = function verifyClient(info, cb) {
    var token = info.req.headers.token;
    if (!token){
        cb(false, 401, 'Unauthorized');
    }else {
        jwt.verify(token, process.jwtSecret || 'mysecret', function (err, decoded) {
            if (err) {
                cb(false, 401, 'Unauthorized');
            } else {
                info.req.user = decoded;
                cb(true);
            }
        });
    }
}