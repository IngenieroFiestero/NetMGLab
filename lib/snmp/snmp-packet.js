const constants = require('./constants');
const ENCODERS = constants.ENCODERS;
const DECODERS = constants.DECODERS;
const SNMP_VERSIONS = constants.SNMP_VERSIONS;
const ENCODING_RULES = constants.ENCODING_RULES;
const PDU = require('./pdu');
const VarBind = require('./varbinds');
const assert = require('assert');
class SNMPPacket {
    /**
     * Create a new snmp packet
     * @param {Number | Buffer} version/buffer
     * @param {String | Number} community/algorithm
     * @param {PDU?} pdu
     */
    constructor(version, community, pdu) {
        if (version instanceof Buffer) {
            var buf = version;
            var alg = (community instanceof Number || typeof community == 'number') ? community : ENCODING_RULES.BER;
            var oid, bvb, vb, hdr, vbhdr;
            var decoder = DECODERS[alg];
            var pdu = new PDU();
            //Remove first two bytes
            hdr = decoder.typeAndLength(buf);
            assert.equal(decoder.TAG.Sequence, hdr.type);
            buf = buf.slice(hdr.header);
            // Then comes the version field (integer). Parse it and slice it.
            this.version = decoder.parseInteger(buf.slice(0, buf[1] + 2));
            buf = buf.slice(2 + buf[1]);
            // We then get the community. Parse and slice.
            this.community = decoder.parseOctetString(buf.slice(0, buf[1] + 2));
            buf = buf.slice(2 + buf[1]);
            // Here's the PDU structure. We're interested in the type. Slice the rest.
            hdr = decoder.typeAndLength(buf);
            if (hdr.type >= 0xA0) {
                pdu.type = hdr.type - 0xA0;
            } else {
                pdu.type = hdr.type;
            }
            buf = buf.slice(hdr.header);
            // The request id field.
            pdu.reqid = decoder.parseInteger(buf.slice(0, buf[1] + 2));
            buf = buf.slice(2 + buf[1]);
            // The error field.
            pdu.error = decoder.parseInteger(buf.slice(0, buf[1] + 2));
            buf = buf.slice(2 + buf[1]);
            // The error index field.
            pdu.errorIndex = decoder.parseInteger(buf.slice(0, buf[1] + 2));
            buf = buf.slice(2 + buf[1]);
            // Here's the varbind list. Not interested.
            hdr = decoder.typeAndLength(buf);
            assert.equal(decoder.TAG.Sequence, hdr.type);
            buf = buf.slice(hdr.header);

            // Now comes the varbinds. There might be many, so we loop for as long as we have data.
            pdu.varBinds = [];
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
                pdu.varBinds.push(vb);

                // Go fetch the next varbind, if there seems to be any.
                if (buf.length > hdr.header + hdr.len) {
                    buf = buf.slice(hdr.header + hdr.len);
                } else {
                    break;
                }
            }
            this.pdu = pdu;
        } else {
            this.version = version || SNMP_VERSIONS.SNMPv2c;
            this.community = community || 'public';
            this.pdu = pdu || new PDU();
        }
    }
    /**
     * Encodes a snmp packet (pkt) using a algorithm of encoding(alg)
     * @param {Number} alg - Alghoritm of encoding
     */
    encode(alg = ENCODING_RULES.BER) {
        var version, community, reqid, err, erridx, vbs, pdu, message;
        var encoder = ENCODERS[alg];
        if (this.version !== SNMP_VERSIONS.SNMPv1 && this.version !== SNMP_VERSIONS.SNMPv2c) {
            throw new Error('Only SNMPv1 and SNMPv2c are supported.');
        }
        version = encoder.encodeInteger(this.version);
        community = encoder.encodeOctetString(this.community);
        reqid = encoder.encodeInteger(this.pdu.reqid);
        err = encoder.encodeInteger(this.pdu.error);
        erridx = encoder.encodeInteger(this.pdu.errorIndex);
        // Encode the PDU varbinds.
        vbs = [];
        this.pdu.varBinds.forEach(function (vb) {
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
        pdu = encoder.encodeRequest(this.pdu.type, concatBuffers([reqid, err, erridx, vbs]));

        // Create the message by concatenating the header fields and the PDU.
        message = encoder.encodeSequence(concatBuffers([version, community, pdu]));

        return message;

    }

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
module.exports = SNMPPacket;