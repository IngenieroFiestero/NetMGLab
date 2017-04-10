const Buffer = require('buffer').Buffer;
const constants = require('../constants/ber');
const LOG256 = Math.log(256);

/**
 * Parse and return type, data length and header length.
 * @param {Buffer} buf
 */
function typeAndLength(buf) {
    var res, len, i;

    res = { type: buf[0], len: 0, header: 1 };
    if (buf[1] < 128) {
        // If bit 8 is zero, this byte indicates the content length (up to 127 bytes).
        res.len = buf[1];
        res.header += 1;
    } else {
        // If bit 8 is 1, bits 0 to 7 indicate the number of following legth bytes.
        // These bytes are a simple msb base-256 integer indicating the content length.
        for (i = 0; i < buf[1] - 128; i++) {
            res.len *= 256;
            res.len += buf[i + 2];
        }
        res.header += buf[1] - 128 + 1;
    }
    return res;
}

exports.typeAndLength = typeAndLength;
exports.TAG = constants.TAG;

/**
 * Parse a buffer containing a representation of an integer.
 * Verifies the type, then multiplies in each byte as it comes.
 */
exports.parseInteger = function (buf) {
    var i, val, type, len;

    type = buf[0];
    len = buf[1];

    if (type !== constants.TAG.Integer && type !== constants.TAG.Counter &&
        type !== constants.TAG.Counter64 && type !== constants.TAG.Gauge &&
        type !== constants.TAG.TimeTicks) {
        throw new Error('Buffer ' + buf.toString('hex') + ' does not appear to be an Integer');
    }

    val = 0;
    for (i = 0; i < len; i++) {
        val *= 256;
        val += buf[i + 2];
    }

    if (buf[2] > 127 && type === constants.TAG.Integer) {
        return val - Math.pow(2, 8 * buf[1]);
    } else {
        return val;
    }
};


/**
 * Parse a buffer containing a representation of an OctetString.
 * Verify the type, then just grab the string out of the buffer.
 */
exports.parseOctetString = function (buf) {
    var i, len, lenBytes = 0;

    if (buf[0] !== constants.TAG.OctetString) {
        throw new Error('Buffer does not appear to be an OctetString');
    }

    // SNMP doesn't specify an encoding so I pick UTF-8 as the 'most standard'
    // encoding. We'll see if that assumption survives contact with actual reality.

    len = buf[1];
    if (len > 128) {
        // Multi byte length encoding
        lenBytes = len - 128;
        len = 0;
        for (i = 0; i < lenBytes; i++) {
            len *= 256;
            len += buf[2+i];
        }
    }
    return buf.toString('utf-8', 2 + lenBytes, 2 + lenBytes + len);
};


/**
 * Parse a buffer containing a representation of an ObjectIdentifier.
 * Verify the type, then apply the relevent encoding rules.
 */
exports.parseOid = function (buf) {
    var oid, val, i, o1, o2;

    if (buf[0] !== constants.TAG.ObjectIdentifier) {
        throw new Error('Buffer does not appear to be an ObjectIdentifier');
    }

    // The first byte contains the first two numbers in the OID. They're
    // magical! They're compactly encoded in a special way!
    o1 = parseInt(buf[2] / 40, 10);
    if (o1 > 2) {
        o1 = 2;
    }
    o2 = buf[2] - 40 * o1;
    oid = [o1, o2];

    // The rest of the data is a base-128-encoded OID
    for (i = 0; i < buf[1] - 1; i++) {
        val = 0;
        while (buf[i + 3] >= 128) {
            val += buf[i + 3] - 128;
            val *= 128;
            i++;
        }
        val += buf[i + 3];
        oid.push(val);
    }
    return oid;
};

/**
 * Parse a buffer containing a representation of an array type.
 * This is for example an IpAddress.
 */
exports.parseArray = function (buf) {
    var i, nelem, array;

    if (buf[0] !== constants.TAG.IpAddress) {
        throw new Error('Buffer does not appear to be an array type.');
    }

    nelem = buf[1];
    array = [];

    for (i = 0; i < buf[1]; i++) {
        array.push(buf[i + 2]);
    }

    return array;
};


/**
 * Parse a buffer containing a representation of an opaque type.
 * This is for example an IpAddress.
 */
exports.parseOpaque = function (buf) {
    var hdr;

    hdr = typeAndLength(buf);

    if (hdr.type !== constants.TAG.Opaque) {
        throw new Error('Buffer does not appear to be an opaque type.');
    }

    return '0x' + buf.slice(hdr.header).toString('hex');
};