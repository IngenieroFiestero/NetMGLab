const Buffer = require('buffer').Buffer;
const constants = require('../constants/ber');
const LOG256 = Math.log(256);

exports.TAG = constants.TAG;
/**
 * Return a wrapped copy of the passed `contents`, with the specified wrapper type.
 * This is used for Sequence and other constructed types.
 * @param {Number} type
 * @param {[Number]} contents
 */
function wrapper(type, contents) {
    var buf, len, i;

    // Get the encoded length of the contents
    len = encodeLengthArray(contents.length);

    // Set up a buffer with the type and length bytes plus a straight copy of the content.
    buf = new Buffer(1 + contents.length + len.length);
    buf[0] = type;
    for (i = 1; i < len.length + 1; i++) {
        buf[i] = len[i - 1];
    }
    contents.copy(buf, len.length + 1, 0);
    return buf;
}
/**
 * Encode the length of an array
 * @param {Number} len
 */
function encodeLengthArray(len) {
    var arr = [];
    if (len <= 127) {
        // Return a single byte if the value is 127 or less.
        return [ len ];
    } else {
        // Otherwise encode it as a MSB base-256 integer.
        while (len > 0) {
            arr.push(len % 256);
            len = parseInt(len / 256, 10);
        }
        // Add a length byte in front and set the high bit to indicate
        // that this is a longer value than one byte.
        arr.push(128 + arr.length);
        arr.reverse();
        return arr;
    }
}

/**
 * Get the encoded representation of a number in an OID.
 * If the number is less than 128, pass it as it is.
 * Otherwise return an array of base-128 digits, most significant first,
 * with the high bit set on all octets except the last one.
 * This encoding should be used for all number in an OID except the first
 * two (.1.3) which are handled specially.
 * @param {Number} val
 */
function encodeOIDInt(val) {
    var bytes = [];

    bytes.push(val % 128);
    val = parseInt(val / 128, 10);
    while (val > 127) {
        bytes.push(128 + val % 128);
        val = parseInt(val / 128, 10);
    }
    bytes.push(val + 128);
    return bytes.reverse();
}

/**
 * Encode an OID. The first two number are encoded specially
 * in the first octet, then the rest are encoded as one octet per number
 * unless the number exceeds 127. If so, it's encoded as several base-127
 * octets with the high bit set to indicate continuation.
 * @param {[Number]} oid
 */
function encodeOID(oid) {
    var bytes, i, val;

    //Requirements of OID
    if (oid.length < 2) {
        throw new Error("Minimum OID length is two.");
    } else if (oid[0] > 2) {
        throw new Error("Invalid OID");
    } else if (oid[0] == 0 && oid[1] > 39) {
        throw new Error("Invalid OID");
    } else if (oid[0] == 1 && oid[1] > 39) {
        throw new Error("Invalid OID");
    } else if (oid[0] == 2 && oid[1] > 79) {
        throw new Error("Invalid OID");
    }

    /**
     * The first sub-identifier is a small number, such as 0, 1 or 2 and mathematically
     *  combines it with the second identifier, which may be longer. If we multiply the 
     * first by 40 and add the second, we will only need an ID no two IDs .
     */
    bytes = [ 40 * oid[0] + oid[1] ];
    // For the rest of the OID, encode each number individually and add the
    // resulting bytes to the buffer.
    for (i = 2; i < oid.length; i++) {
        val = oid[i];
        if (val > 127) {
            
            bytes = bytes.concat(encodeOIDInt(val));
        } else {
            bytes.push(val);
        }
    }

    return bytes;
}

/**
 * Divide an integer into base-256 bytes.
 * Most significant byte first.
 * @param {Number} val
 */
function encodeIntArray(val) {
    var array = [], encVal = val, bytes;

    if (val === 0) {
        array.push(0);
    } else {
        if (val < 0) {
            bytes = Math.floor(1 + Math.log(-val) / LOG256);
            // Encode negatives as 32-bit two's complement.
            encVal += Math.pow(2, 8 * bytes);
        }
        while (encVal > 0) {
            array.push(encVal % 256);
            encVal = parseInt(encVal / 256, 10);
        }
    }

    // Do not produce integers that look negative (high bit
    // of first byte set).
    if (val > 0 && array[array.length - 1] >= 0x80) {
        array.push(0);
    }

    return array.reverse();
}
// Functions to encode ASN.1 from native objects

/**
 *  Encode a simple integer.
 *  Integers are encoded as a simple base-256 byte sequence, most significant byte first,
 *  prefixed with a length byte. In principle we support arbitrary integer sizes, in practice
 *  Javascript doesn't even **have** integers so some precision might get lost.
 * @param {Number} val
 * @param {Number} type
 */
function encodeInt(val, type) {
    var i, arr, buf;

    // Get the bytes that we're going to encode.
    arr = encodeIntArray(val);

    // Now that we know the length, we allocate a buffer of the required size.
    // We set the type and length bytes appropriately.
    buf = new Buffer(2 + arr.length);
    buf[0] = type;
    buf[1] = arr.length;

    // Copy the bytes into the array.
    for (i = 0; i < arr.length; i++) {
        buf[i + 2] = arr[i];
    }

    return buf;
}

// Integer type, 0x02
exports.encodeInteger = function (val) {
    return(encodeInt(val, constants.TAG.Integer));
};

// Gauge type, 0x42
exports.encodeGauge = function (val) {
    return(encodeInt(val, constants.TAG.Gauge));
};

// Counter type, 0x41
exports.encodeCounter = function (val) {
    return(encodeInt(val, constants.TAG.Counter));
};

// TimeTicks type, 0x43
exports.encodeTimeTicks = function (val) {
    return(encodeInt(val, constants.TAG.TimeTicks));
};

// Create the representation of a Null, `05 00`.

exports.encodeNull = function () {
    var buf = new Buffer(2);
    buf[0] = constants.TAG.Null;
    buf[1] = 0;
    return buf;
};


/**
 * Encode a Sequence, which is a wrapper of type `30`.
 * @param {[Number]} contents
 */
exports.encodeSequence = function (contents) {
    return wrapper(constants.TAG.Sequence, contents);
};

/**
 * Encode an OctetString, which is a wrapper of type `04`.
 * @param {String} string
 */
exports.encodeOctetString = function (string) {
    var buf, contents;

    if (typeof string === 'string') {
        contents = new Buffer(string);
    } else if (Buffer.isBuffer(string)) {
        contents = string;
    } else {
        throw new Error('Only Buffer and string types are acceptable as OctetString.');
    }

    return wrapper(constants.TAG.OctetString, contents);
};

/**
 * Encode an IpAddress, which is a wrapper of type `40`.
 * @param {String} address
 */
exports.encodeIpAddress = function (address) {
    var contents, octets, value = [];
    if (!(typeof address === 'string' ||  address instanceof String ) && !Buffer.isBuffer(address) && !(address instanceof Array && (address[0] instanceof Number || typeof address[0] === 'number')) ) {
        throw new Error('Only Buffer and string types are acceptable as IpAddress.');
    }
    if(address instanceof Array){
        octets = address;
    }else{
        octets = address.toString().split('.');
    }
    // assume that the string is in dotted decimal format ipv4
    // also, use toString in case a buffer was passed in.

    
    if (octets.length !== 4) {
        throw new Error('IP Addresses must be specified in dotted decimal format.');
    }
    octets.forEach(function (octet) {
        var octetValue = parseInt(octet, 10);
        if (octet < 0 || octet > 255) {
            throw new Error('IP Address octets must be between 0 and 255 inclusive.' + JSON.stringify(octets));
        }
        value.push(octetValue);
    });

    contents = new Buffer(value);

    return wrapper(constants.TAG.IpAddress, contents);
};

/**
 * Encode an ObjectId.
 * @param {[Number]} contents
 */
exports.encodeOid = function (oid) {
    if(typeof oid === 'string' || oid instanceof String){
        oid = oid.split('.').map(Number);
    }
    var buf, bytes, i, len;

    // Get the encoded format of the OID.
    bytes = encodeOID(oid);

    // Get the encoded format of the length
    len = encodeLengthArray(bytes.length);

    // Fill in the buffer with type, length and OID data.
    buf = new Buffer(1 + bytes.length + len.length);
    buf[0] = constants.TAG.ObjectIdentifier;
    for (i = 1; i < len.length + 1; i++) {
        buf[i] = len[i - 1];
    }
    for (i = len.length + 1; i < bytes.length + len.length + 1; i++) {
        buf[i] = bytes[i - len.length - 1];
    }

    return buf;
};

/**
 * Encode an SNMP request with specified `contents`.
 * The `type` code is 0 for `GetRequest`, 1 for `GetNextRequest`.
 * @param {Number} type
 * @param {[Number]} contents
 */
exports.encodeRequest = function (type, contents) {
    return wrapper(constants.TAG.PDUbase | (type %127), contents);
};
