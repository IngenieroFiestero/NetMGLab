"use strict";
const berEncoder = require('./ASN1/encoders/ber.js');
//const derEncoder = require('./asn1/encoders/der.js');
const berDecoder = require('./ASN1/decoders/ber.js');
//const derDecoder = require('./asn1/decoders/der.js');
class VarBind {
    /**
     * The OID-Value Pair
     */
    constructor(type, value, oid) {
        this.type = type || 5;
        this.value = valorize(type, value) || null;
        this.oid = oid ? string2oid(oid) : [1, 2, 3];
    }
}
/**
 * Converts a string into a oid
 * @param {String} oid
 */
function string2oid(oid) {
    if (typeof oid === 'string' || oid instanceof String) {
        return oid.split('.').map(Number);
    } else if ((typeof oid === 'array' || oid instanceof Array) && (oid[0] instanceof Number || typeof oid[0] === 'number')) {
        return oid;
    } else {
        throw new Error('Not valid OID variable type: ' + oid);
    }
}
/**
 * Set the appropiate value. Ej: type = IpAddress, value = '127.0.0.1' => value = [127.0.0.1]
 */
function valorize(type, value) {
    switch (type) {
        case berEncoder.TAG.Integer:
            return Number(value);
        case berEncoder.TAG.OctetString:
            return String(value);
        case berEncoder.TAG.IpAddress:
            return string2Ip(value);
        default:
            return value;
    }
}
/**
 * Convert a IpAddress string into a Number array.Ej: type = IpAddress, value = '127.0.0.1' => value = [127.0.0.1]
 * @param {String} address
 */
function string2Ip(address) {
    if (!(typeof address === 'string' || address instanceof String) && !(Buffer.isBuffer(address) || (address instanceof Array && (adress[0] instanceof Number || typeof address[0] === 'number')))) {
        throw new Error('Only Buffer and string types are acceptable as OctetString.');
    }
    var octets = address.toString().split('.').map(Number);
    if (octets.length !== 4) {
        throw new Error('IP Addresses must be specified in dotted decimal format.');
    }
    for (var i = 0; i < octets.length; i++) {
        if (octets[i] < 0 || octets[i] > 255) {
            throw new Error('IP Address octets must be between 0 and 255 inclusive.' + JSON.stringify(octets));
        }
    }
    return octets;
}
module.exports = VarBind;