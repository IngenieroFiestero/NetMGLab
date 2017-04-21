const snmp = require('./lib/snmp');
const SNMPAgent = require('./lib/snmp-agent');
const dgram = require('dgram')
var fakePckt = new snmp.SNMPPacket(snmp.SNMP_VERSIONS.SNMPv2c, 'comm', new snmp.PDU(
    snmp.PDU_TYPES.GetRequestPDU,
    10,
    0,
    0,
    [new snmp.VarBind(snmp.TAG.Integer, 17, '1.2.3.16')]
));
var sock = dgram.createSocket('udp4');
sock.bind(9011, 'localhost', () => {
    console.log('Binded');
    var buff = fakePckt.encode(snmp.ENCODING_RULES.BER);
    sock.send(buff, 0, buff.length, 9000, 'localhost');
});