var events = require('events');
var dgram = require('dgram');

/**
 * Create a new SNMP Agent
 * 
 * - agent.port : Port where SNMP Agent will listen.
 * - agent.device : Real device. The admin is the only one who can manage devices.
 * - agent.readOnlyCommunity : The community where users can only read.
 * - agent.readWriteCommunity : The community where users can read and write.
 * - agent.description: Text to facilitate understanding.
 * - agent.name : The name for this SNMP agent.
 * - agent.userGroup: Which users can manage this agent.
 * - agent.mibList : The MIBs availables.
 * 
 * @param {Object} agent - SNMP agent described in ../models/snmp_agent
 */
function SNMPAgent(agent) {
    this.socket = dgram.createSocket({type : 'udp4', reuseAddr :true});
    console.log("Listener started on port : " + agent.port);
    this.socket.bind(agent.port);
    this.oidRequested;
    this.socket.on('message', this.messageRecieved.bind(this));
    this.emit('listening');
    
}
SNMPAgent.prototype = new events.EventEmitter();

/**
 * Datagram received
 * @param {'Buffer'} msg - The message
 * @param {Object} rinfo - Remote address information
 * @param {String} rinfo.address - The sender address
 * @param {String} rinfo.family - The address family
 * @param {Number} rinfo.port - The sender port
 * @param {Number} rinfo.size - The message size
 */
SNMPAgent.prototype.messageRecieved = (msg, rinfo)=> {
    console.log("Mensaje recibido");
/*
    var request = snmp.parse(msg);
    var oid = request.pdu.varbinds[0].oid;

    this.oidRequested = oid;

    var getNext = (request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU || request.pdu.type == asn1ber.pduTypes.GetNextRequestPDU2);

    console.log((getNext ? "GetNext" : "Get") + "Request id:" + request.pdu.reqid + ", OID: " + request.pdu.varbinds[0].oid + ", IpAddress :" + rinfo.address);
*/
};

/**
 * Stop the SNMPAgent UDP socket
 */
SNMPAgent.prototype.stop = ()=>{
    var self = this;
    this.socket.close(()=>{
        self.emit('close');
    });
};

module.exports = SNMPAgent;