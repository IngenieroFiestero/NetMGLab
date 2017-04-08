const berEncoder = require('./ASN1/encoders/ber.js');
//const derEncoder = require('./asn1/encoders/der.js');
const berDecoder = require('./ASN1/decoders/ber.js');
//const derDecoder = require('./asn1/decoders/der.js');
const assert = require('assert');
const SNMP_VERSIONS = {
    SNMPv1: 0,
    SNMPv2c: 1,
    SNMPv2p: 2,
    SNMPv2u: 2,
    SNMPv3: 3
}
exports.SNMP_VERSIONS = SNMP_VERSIONS;

const PDU_TYPES = {
    GetRequestPDU: 0,
    GetNextRequestPDU: 0x101,
    ResponsePDU: 2,
    SetRequestPDU: 3
}
exports.PDU_TYPES = PDU_TYPES;

const ENCODING_RULES = {
    BER: 0,
    DER: 1
}
exports.ENCODING_RULES = ENCODING_RULES;
exports.TAG = berEncoder.TAG;
//Encoders decoders
const ENCODERS = [
    berEncoder
];
const DECODERS = [
    berDecoder
];

/**
 * Create a new snmp packet
 * @param {Number} version
 * @param {String} community
 * @param {"PDU"} pdu
 */
function SNMPPacket(version, community, pdu) {
    this.version = version || SNMP_VERSIONS.SNMPv2c;
    this.community = community || 'public';
    this.pdu = pdu || new PDU();
}
exports.SNMPPacket = SNMPPacket;
/**
 * The PDU contains the SNMP request/response and the VarBinds
 * @param {Number} type
 * @param {Number} reqid
 * @param {Number} error
 * @param {Number} errorIndex
 * @param {"VarBind"} varBinds
 */
function PDU(type, reqid, error, errorIndex, varBinds) {
    this.type = type || PDU_TYPES.GetRequestPDU;
    this.reqid = reqid || 1;
    this.error = error || 0;
    this.errorIndex = errorIndex || 0;
    this.varBinds = varBinds || [new VarBind()];
}
exports.PDU = PDU;
/**
 * The OID-Value Pair
 */
function VarBind(type, value, oid) {
    this.type = type || 5;
    this.value = valorize(type, value) || null;
    this.oid = oid ? string2oid(oid) : [1, 2, 3];
}
exports.VarBind = VarBind;
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
function string2Ip(address){
    if (!(typeof address === 'string' ||  address instanceof String ) && !(Buffer.isBuffer(address) || (address instanceof Array && (adress[0] instanceof Number || typeof address[0] === 'number') ))) {
        throw new Error('Only Buffer and string types are acceptable as OctetString.');
    }
    var octets = address.toString().split('.').map(Number);
    if (octets.length !== 4) {
        throw new Error('IP Addresses must be specified in dotted decimal format.');
    }
    for(var i = 0; i < octets.length; i++){
        if (octets[i] < 0 || octets[i] > 255) {
            throw new Error('IP Address octets must be between 0 and 255 inclusive.' + JSON.stringify(octets));
        }
    }
    return octets;
}
/**
 * Concatenate different buffers in a single assurance first that they are a buffer instance.
 * @param {[Buffer]} buffers
 */
function concatBuffers(buffers) {
    var total, cur = 0, buf;

    // First we calculate the total length,
    total = buffers.reduce(function (tot, b) {
        return tot + (b ? b.length : 0);
    }, 0);

    // then we allocate a new Buffer large enough to contain all data,
    buf = new Buffer(total);
    buffers.forEach(function (buffer) {
        // finally we copy the data into the new larger buffer.
        if (buffer && buffer instanceof Buffer) {
            buffer.copy(buf, cur, 0);
            cur += buffer.length;
        }
    });
    return buf;
}
/**
 * Encodes a snmp packet (pkt) using a algorithm of encoding(alg)
 * @param {SNMPPacket} pkt - The packet
 * @param {Number} alg - Alghoritm of encoding
 */
function encode(pkt, alg=ENCODING_RULES.BER) {
    var version, community, reqid, err, erridx, vbs, pdu, message;
    var encoder = ENCODERS[alg];
    if (pkt.version !== SNMP_VERSIONS.SNMPv1 && pkt.version !== SNMP_VERSIONS.SNMPv2c) {
        throw new Error('Only SNMPv1 and SNMPv2c are supported.');
    }
    version = encoder.encodeInteger(pkt.version);
    community = encoder.encodeOctetString(pkt.community);
    reqid = encoder.encodeInteger(pkt.pdu.reqid);
    err = encoder.encodeInteger(pkt.pdu.error);
    erridx = encoder.encodeInteger(pkt.pdu.errorIndex);
    // Encode the PDU varbinds.
    vbs = [];
    pkt.pdu.varBinds.forEach(function (vb) {
        var oid = encoder.encodeOid(vb.oid), val;
        if (vb.type === encoder.TAG.Null || vb.value === null) {
            val = encoder.encodeNull();
        } else if (vb.type === encoder.TAG.Integer) {
            val = encoder.encodeInteger(vb.value);
        } else if (vb.type === encoder.TAG.Gauge) {
            val = encoder.encodeGauge(vb.value);
        } else if (vb.type === encoder.TAG.IpAddress) {
            val = encoder.encodeIpAddress(vb.value);
        } else if (vb.type === encoder.TAG.OctetString) {
            val = encoder.encodeOctetString(vb.value);
        } else if (vb.type === encoder.TAG.ObjectIdentifier) {
            val = encoder.encodeOid(vb.value, true);
        } else if (vb.type === encoder.TAG.Counter) {
            val = encoder.encodeCounter(vb.value);
        } else if (vb.type === encoder.TAG.TimeTicks) {
            val = encoder.encodeTimeTicks(vb.value);
        } else {
            throw new Error('Unknown varbind type "' + vb.type + '" in encoding.');
        }
        vbs.push(encoder.encodeSequence(concatBuffers([oid, val])));
    });
    // Concatenate all the varbinds together.
    vbs = encoder.encodeSequence(concatBuffers(vbs));

    // Create the PDU by concatenating the inner fields and adding a request structure around it.
    pdu = encoder.encodeRequest(pkt.pdu.type, concatBuffers([reqid, err, erridx, vbs]));

    // Create the message by concatenating the header fields and the PDU.
    message = encoder.encodeSequence(concatBuffers([version, community, pdu]));

    return message;

}
exports.encode = encode;

/**
 * Parse an SNMP packet into its component fields.
 * @param {Buffer} buf - Buffer
 * @param {Number} alg - Algorithm
 */
function decode(buf, alg=ENCODING_RULES.BER) {
    var pkt, oid, bvb, vb, hdr, vbhdr;
    var decoder = DECODERS[alg];
    pkt = new SNMPPacket();
    //Remove first two bytes
    hdr = decoder.typeAndLength(buf);
    assert.equal(decoder.TAG.Sequence, hdr.type);
    buf = buf.slice(hdr.header);
    // Then comes the version field (integer). Parse it and slice it.
    pkt.version = decoder.parseInteger(buf.slice(0, buf[1] + 2));
    buf = buf.slice(2 + buf[1]);
    // We then get the community. Parse and slice.
    pkt.community = decoder.parseOctetString(buf.slice(0, buf[1] + 2));
    buf = buf.slice(2 + buf[1]);
    // Here's the PDU structure. We're interested in the type. Slice the rest.
    hdr = decoder.typeAndLength(buf);
    if (hdr.type >= 0xA0) {
        pkt.pdu.type = hdr.type - 0xA0;
    } else {
        pkt.pdu.type = hdr.type;
    }
    buf = buf.slice(hdr.header);
    // The request id field.
    pkt.pdu.reqid = decoder.parseInteger(buf.slice(0, buf[1] + 2));
    buf = buf.slice(2 + buf[1]);
    // The error field.
    pkt.pdu.error = decoder.parseInteger(buf.slice(0, buf[1] + 2));
    buf = buf.slice(2 + buf[1]);
    // The error index field.
    pkt.pdu.errorIndex = decoder.parseInteger(buf.slice(0, buf[1] + 2));
    buf = buf.slice(2 + buf[1]);
    // Here's the varbind list. Not interested.
    hdr = decoder.typeAndLength(buf);
    assert.equal(decoder.TAG.Sequence, hdr.type);
    buf = buf.slice(hdr.header);

    // Now comes the varbinds. There might be many, so we loop for as long as we have data.
    pkt.pdu.varBinds = [];
    while (buf[0] === decoder.TAG.Sequence) {
        vb = new VarBind();

        // Slice off the sequence header.
        hdr = decoder.typeAndLength(buf);
        assert.equal(decoder.TAG.Sequence, hdr.type);
        bvb = buf.slice(hdr.header, hdr.len + hdr.header);

        // Parse and save the ObjectIdentifier.
        vb.oid = decoder.parseOid(bvb);

        /* Parse the value. We use the type marker to figure out
         what kind of value it is and call the appropriate parser
         routine. For the SNMPv2c error types, we simply set the
         value to a text representation of the error and leave handling
         up to the user.
        */
        var vb_name_hdr = decoder.typeAndLength(bvb);
        bvb = bvb.slice(vb_name_hdr.header + vb_name_hdr.len);
        var vb_value_hdr = decoder.typeAndLength(bvb);
        vb.type = vb_value_hdr.type;
        if (vb.type === decoder.TAG.Null) {
            // Null type.
            vb.value = null;
        } else if (vb.type === decoder.TAG.OctetString) {
            // Octet string type.
            vb.value = decoder.parseOctetString(bvb);
        } else if (vb.type === decoder.TAG.Integer ||
            vb.type === decoder.TAG.Counter ||
            vb.type === decoder.TAG.Counter64 ||
            vb.type === decoder.TAG.TimeTicks ||
            vb.type === decoder.TAG.Gauge) {
            // Integer type and it's derivatives that behave in the same manner.
            vb.value = decoder.parseInteger(bvb);
        } else if (vb.type === decoder.TAG.ObjectIdentifier) {
            // Object identifier type.
            vb.value = decoder.parseOid(bvb);
        } else if (vb.type === decoder.TAG.IpAddress) {
            // IP Address type.
            vb.value = decoder.parseArray(bvb);
        } else if (vb.type === decoder.TAG.Opaque) {
            // Opaque type. The 'parsing' here is very light; basically we return a
            // string representation of the raw bytes in hex.
            vb.value = decoder.parseOpaque(bvb);
        } else if (vb.type === decoder.TAG.EndOfMibView) {
            // End of MIB view error, returned when attempting to GetNext beyond the end
            // of the current view.
            vb.value = 'endOfMibView';
        } else if (vb.type === decoder.TAG.NoSuchObject) {
            // No such object error, returned when attempting to Get/GetNext an OID that doesn't exist.
            vb.value = 'noSuchObject';
        } else if (vb.type === decoder.TAG.NoSuchInstance) {
            // No such instance error, returned when attempting to Get/GetNext an instance
            // that doesn't exist in a given table.
            vb.value = 'noSuchInstance';
        } else {
            // Something else that we can't handle, so throw an error.
            // The error will be caught and presented in a useful manner on stderr,
            // with a dump of the message causing it.
            throw new Error('Unrecognized value type ' + vb.type);
        }

        // Take the raw octet string value and preseve it as a buffer and hex string.
        /* We dont want the raw buff
        vb.valueRaw = bvb.slice(vb_value_hdr.header, vb_value_hdr.header + vb_value_hdr.len);
        vb.valueHex = vb.valueRaw.toString('hex');
        */

        // Add the request id to the varbind (even though it doesn't really belong)
        // so that it will be availble to the end user.
        //vb.requestId = pkt.pdu.reqid;

        // Push whatever we parsed to the varbind list.
        pkt.pdu.varBinds.push(vb);

        // Go fetch the next varbind, if there seems to be any.
        if (buf.length > hdr.header + hdr.len) {
            buf = buf.slice(hdr.header + hdr.len);
        } else {
            break;
        }
    }

    return pkt;
}
exports.decode = decode;

/**
 * Compare two OIDs, returning -1, 0 or +1 depending on the relation between oidA and oidB.
 * @param {String} oidA
 * @param {String} oidB
*/
function compareOids(oidA, oidB) {
    var mlen, i;

    // The undefined OID, if there is any, is deemed lesser.
    if (typeof oidA === 'undefined' && typeof oidB !== 'undefined') {
        return 1;
    } else if (typeof oidA !== 'undefined' && typeof oidB === 'undefined') {
        return -1;
    }

    // Check each number part of the OIDs individually, and if there is any
    // position where one OID is larger than the other, return accordingly.
    // This will only check up to the minimum length of both OIDs.
    mlen = Math.min(oidA.length, oidB.length);
    for (i = 0; i < mlen; i++) {
        if (oidA[i] > oidB[i]) {
            return -1;
        } else if (oidB[i] > oidA[i]) {
            return 1;
        }
    }

    // If there is one OID that is longer than the other after the above comparison,
    // consider the shorter OID to be lesser.
    if (oidA.length > oidB.length) {
        return -1;
    } else if (oidB.length > oidA.length) {
        return 1;
    } else {
        // The OIDs are obviously equal.
        return 0;
    }
}

exports.compareOids = compareOids;
