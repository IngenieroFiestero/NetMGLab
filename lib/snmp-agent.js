"use strict";
const EventEmitter = require('events');
const dgram = require('dgram');
const os = require('os');
const windows = os.platform() == 'win32';
const snmp = require('./snmp');
var Schema = require('mongoose').Schema;
var mibDB = require('./mib-db');

class SNMPAgent extends EventEmitter {
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
    constructor (agent) {
        super();
        this.agent = agent;
        var self = this;
        //Windows UDP needs to not share ports -> exclusive = true
        this.socket = dgram.createSocket('udp4');
        this.socket.on('listening', () => {
            self.emit('listening');
        });
        this.socket.on('error', (err) => {
            console.log(err);
        });
        this.socket.on('message', this.messageRecieved.bind(this));
    }
    /**
     * Update the agent information. If the port changes then the socket execution ends and a new socket instance starts listening on the new port.
     */
    updateAgent(agent, cb) {
        var self = this;
        if (this.agent.port != agent.port) {
            //The port changes so restart the agent with the new configuration
            this.socket.close(() => {
                delf.agent = agent;
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
     * @param {Buffer} msg - The message
     * @param {Object} rinfo - Remote address information
     * @param {String} rinfo.address - The sender address
     * @param {String} rinfo.family - The address family
     * @param {Number} rinfo.port - The sender port
     * @param {Number} rinfo.size - The message size
     */
    messageRecieved(msg, rinfo) {
        var self = this;
        try {
            var request = snmp.decode(msg, snmp.ENCODING_RULES.BER);
            var oid = request.pdu.varBinds[0].oid;
            if (request.version > snmp.SNMP_VERSIONS.SNMPv2c) {
                throw new Error('Not valid SNMP version');
            }
            if (request.community !== this.agent.readOnlyCommunity && request.community !== this.agent.readWriteCommunity) {
                //If we reply with a fake message they cant do a bruteforce attack to know the community
                mibDB.fakeResponse(request, (err, response) => {
                    if (err) throw new Error('Not valid community: ' + err.message);
                    self.socket.send(response, 0, response.length, rinfo.port, rinfo.address);
                });
            }
            if (!(this.agent.device instanceof Schema.ObjectId)) {
                if (this.agent.device.ip == '127.0.0.1' || this.agent.device.ip == 'localhost') {
                    //The device is the server

                } else {
                    //Proxy mode, send the SNMP Request to the device across the snmp db module for caching content

                }
            } else {
                throw new Error('Device information incorrect: ' + this.agent.device);
            }
        } catch (err) {
            console.log(err)
        }
    };
    /**
     * Stop the SNMPAgent UDP socket
     */
    stop() {
        var self = this;
        this.socket.close(() => {
            self.emit('stop');
        });
    };
    /**
     * Stop the SNMPAgent UDP socket
     */
    start() {
        this.socket.bind({
            address: 'localhost',
            port: this.agent.port,
            exclusive: (windows == true ? true : false)
        });
    };

}





module.exports = SNMPAgent;