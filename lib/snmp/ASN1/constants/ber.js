exports.TAG = {
    Integer: 0x02,
    OctetString: 0x04,
    Null: 0x05,
    ObjectIdentifier: 0x06,
    Sequence: 0x30,
    IpAddress: 0x40,
    Counter: 0x41,
    Gauge: 0x42,
    TimeTicks: 0x43,
    Opaque: 0x44,
    NsapAddress: 0x45,
    Counter64: 0x46,
    NoSuchObject: 0x80,
    NoSuchInstance: 0x81,
    EndOfMibView: 0x82,
    PDUBase: 0xA0
};
exports.PDU = {
    GetRequestPDU : 0x00,
    GetNextRequestPDU : 0x01,
    GetResponsePDU : 0x02,
    SetRequestPDU : 0x03,
    TrapPDU : 0x04
};
exports.ERROR = {
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
exports.TAG_CLASS = {
  universal : 0,
  application : 1,
  context : 2,
  private : 3
};