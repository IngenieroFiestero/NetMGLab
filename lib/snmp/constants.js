const berEncoder = require('./ASN1/encoders/ber.js');
//const derEncoder = require('./asn1/encoders/der.js');
const berDecoder = require('./ASN1/decoders/ber.js');
//const derDecoder = require('./asn1/decoders/der.js');
const SNMP_VERSIONS = {
    SNMPv1: 0,
    SNMPv2c: 1,
    SNMPv2p: 2,
    SNMPv2u: 2,
    SNMPv3: 3
}

const PDU_TYPES = {
    GetRequestPDU: 0,
    GetNextRequestPDU: 0x101,
    ResponsePDU: 2,
    SetRequestPDU: 3
}

const ENCODING_RULES = {
    BER: 0,
    DER: 1
}

//Encoders decoders
const ENCODERS = [
    berEncoder
];
const DECODERS = [
    berDecoder
];
module.exports = {
    SNMP_VERSIONS,
    PDU_TYPES,
    ENCODING_RULES,
    'TAG' : berEncoder.TAG,
    ENCODERS,
    DECODERS
}