var events = require('events');
var dgram = require('dgram');

function SNMPServer(port) {
    console.log("Listener started on port : " + port);
    this.socket = dgram.createSocket('udp4');
    this.socket.bind(port);
    this.oidRequested;
    this.socket.on('message', this.messageRecieved.bind(this));
    this.emit('listening');
    
}
SNMPServer.prototype = new events.EventEmitter();

/**
 * Datagram received
 */
SNMPServer.prototype.messageRecieved = function (msg, rinfo) {

    var request = snmp.parse(msg);
    var oid = request.pdu.varbinds[0].oid;

    this.oidRequested = oid;

    var getNext = (request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU || request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU2);

    console.log((getNext ? "GetNext" : "Get") + "Request id:" + request.pdu.reqid + ", OID: " + request.pdu.varbinds[0].oid + ", IpAddress :" + rinfo.address);
};

exports.init = function (port) {
    return new SNMPServer(port);
};