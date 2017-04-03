var asn1 = exports;

asn1.bignum = require('bn.js');

asn1.define = require('./asn1/api').define;
asn1.base = require('./asn1/base');
asn1.constants = require('./asn1/constants');
asn1.decoders = require('./asn1/decoders');
asn1.encoders = require('./asn1/encoders');
asn1.pduTypes = {
    GetRequestPDU: 0,
    GetNextRequestPDU: 0x101,
    GetResponsePDU: 2,
    SetRequestPDU: 3
};
asn1.errors = {
    NoError: 0,
    TooBig: 1,
    NoSuchName: 2,
    BadValue: 3,
    ReadOnly: 4,
    GenErr: 5,
    NoAccess: 6,
    WrongType: 7,
    WrongLength: 8,
    WrongEncoding: 9,
    WrongValue: 10,
    NoCreation: 11,
    InconsistentValue: 12,
    ResourceUnavailable: 13,
    CommitFailed: 14,
    UndoFailed: 15,
    AuthorizationError: 16,
    NotWritable: 17,
    InconsistentName: 18
};