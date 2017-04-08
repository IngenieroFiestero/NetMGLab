const snmp = require('../lib/snmp');
const tags = require('../lib/ASN1/constants/ber');
const assert = require('assert');
const SNMPPacket = snmp.SNMPPacket;
const PDU = snmp.PDU;
const VarBind = snmp.VarBind;
var varBinds = [
    new VarBind(tags.TAG.OctetString, 'PACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAO', '1.2.3.4'),
    new VarBind(tags.TAG.Integer, 12, '1.2.3.4'),
    new VarBind(tags.TAG.OctetString, 'PACO', '1.2.3.4.28989'),
    new VarBind(tags.TAG.IpAddress, '127.0.0.1', '1.2.3.4.28989')
];
var pckt = new SNMPPacket(
    snmp.SNMP_VERSIONS.SNMPv2c,
    "public",
    new PDU(
        snmp.PDU_TYPES.GetRequestPDU,
        10,
        0,
        0, varBinds
    )
);
/**
 * console.log("----------------------PACKET----------------------");
 * console.log(pckt);
 * console.log(pckt.pdu.varBinds);
 */
var encodedpckt = snmp.encode(pckt, snmp.ENCODING_RULES.BER)
/**
 * console.log("----------------------ENCODED PACKET----------------------")
 * console.log(encodedpckt)
 */
var decodedPckt = snmp.decode(encodedpckt, snmp.ENCODING_RULES.BER);
/**
 * console.log("----------------------DECODED PACKET----------------------");
 * console.log(decodedPckt);
 * console.log(decodedPckt.pdu.varBinds)
*/
describe('SNMP TEST', ()=>{
    it('PDU Request must be the same',()=>{
        assert.deepEqual(decodedPckt,pckt);
    });
});
