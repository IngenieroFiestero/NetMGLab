const assert = require('assert');
const snmp = require('../lib/snmp');
const SNMPAgent = require('../lib/snmp-agent');
const dgram = require('dgram')
var agente = new SNMPAgent({ port: 8002, device: "paco", readOnlyCommunity: "pub", readWriteCommunity: "priv", name: "paco agent" });
const cluster = require('cluster');

if (cluster.isMaster) {
    describe('SNMP AGENT', function () {
        describe('#start()', function () {
            it('should start', function (done) {
                agente.on('listening', () => {
                    done();
                });
                agente.start();
            });
        });
        describe('#BadMessageRecieved()', function () {
            it('should send a fake response', function (done) {
                //Simulate sending a bad snmp request with a bad community, then the agent responses a fake message to mitigate bruteforce attack
                //The community isnt 'comm' is 'pub' or 'priv'
                var fakePckt = new snmp.SNMPPacket(snmp.SNMP_VERSIONS.SNMPv2c, 'comm', new snmp.PDU(
                    snmp.PDU_TYPES.GetRequestPDU,
                    10,
                    0,
                    0,
                    [new snmp.VarBind(snmp.TAG.Integer, 17, '1.2.3.16')]
                ));
                var sock = dgram.createSocket('udp4');
                sock.on('message', (msg) => {
                    done();
                });
                sock.bind(9001, 'localhost', () => {
                    var buff = snmp.encode(fakePckt, snmp.ENCODING_RULES.BER);
                    sock.send(buff, 0, buff.length, 8002, 'localhost');
                });

            });
        });

        describe('#stop()', function () {
            it('should stop', function (done) {
                agente.on('stop', () => {
                    done();
                });
                agente.stop();
            });
        });
    });
}