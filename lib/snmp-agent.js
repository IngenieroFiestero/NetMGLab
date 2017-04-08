const events = require('events');
const dgram = require('dgram');
const os = require('os');
const windows = os.platform() == 'win32';
const snmp = require('./snmp');
var mibDB = require('./mib-db');
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
 * @param {{port : Number,device : String,readOnlyCommunity : String, readWriteCommunity : String, description : String,name : String,userGroup : String,mibList : []}} agent - SNMP agent described in ../models/snmp_agent
 */
function SNMPAgent(agent) {
    this.agent = agent;//Save info about the agent
    
    //Windows UDP needs to not share ports -> exclusive = true
    this.socket = dgram.createSocket('udp4');
    this.socket.bind({
        address: 'localhost',
        port: agent.port,
        exclusive: (windows == true ? true : false)
    });
    console.log("Listener started on port : " + agent.port);
    this.oidRequested;
    this.socket.on('message', this.messageRecieved.bind(this));
    this.emit('listening');

}
SNMPAgent.prototype = new events.EventEmitter();

/**
 * Update the agent information. If the port changes then the socket execution ends and a new socket instance starts listening on the new port.
 */
SNMPAgent.prototype.updateAgent = (agent, cb) => {
    var self = this;
    if (this.agent.port != agent.port) {
        //The port changes so restart the agent with the new configuration
        this.socket.close(() => {
            var windows = os.platform() == 'win32';
            self.socket = dgram.createSocket('udp4');
            self.socket.bind({
                address: 'localhost',
                port: agent.port,
                exclusive: (windows == true ? true : false)
            });
            self.socket.on('message', this.messageRecieved.bind(this));
            cb();
        });
    } else {
        this.agent = agent;
        cb();
    }
}
/**
 * Datagram received
 * @param {'Buffer'} msg - The message
 * @param {Object} rinfo - Remote address information
 * @param {String} rinfo.address - The sender address
 * @param {String} rinfo.family - The address family
 * @param {Number} rinfo.port - The sender port
 * @param {Number} rinfo.size - The message size
 */
SNMPAgent.prototype.messageRecieved = (msg, rinfo) => {
    console.log("Mensaje recibido");
    try{
        var msg = snmp.decode(msg);
        var oid = request.pdu.varbinds[0].oid;
        console.log(msg);
    }catch(err){

    }
    
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
SNMPAgent.prototype.stop = () => {
    var self = this;
    this.socket.close(() => {
        self.emit('close');
    });
};

module.exports = SNMPAgent;