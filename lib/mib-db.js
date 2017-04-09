var snmp = require('./snmp');
var SNMPPacket = snmp.SNMPPacket;
var PDU = snmp.PDU;
var VarBind = snmp.VarBind;
/**
 * Module to make a SNMP Agent communicate with the in memmory DB.
 * I think that a in memmory 
 */

/**
 * Obtains the SNMPPacket to send to the device
 * @param {SNMPPacket} obj
 * @param {Function} cb
 */
exports.getRequest = (obj,cb)=>{

}
/**
 * Response with a fake message.
 * First we need to know the type of the requested object.
 * Best if uses a timer to simultae the process and transmission of the packet
 * @param {SNMPPacket} obj
 * @param {Function} cb
 */
exports.fakeResponse = (obj,cb)=>{
    var response;
    if(obj.pdu && (obj.pdu.type == snmp.PDU_TYPES.GetRequestPDU || obj.pdu.type == snmp.PDU_TYPES.GetNextRequestPDU)){
        //GetRequestPDU -> response = GetResponsePDU
        response = new SNMPPacket(obj.version,obj.community,new PDU(
            snmp.PDU_TYPES.GetResponsePDU, 
            obj.pdu.reqid,
            0,
            0,
            generateFakeVarBinds(obj)
        ));
    }else if(obj.pdu && obj.pdu.type == snmp.PDU_TYPES.SetRequestPDU){
        response = new SNMPPacket(obj.version,obj.community,new PDU(
            snmp.PDU_TYPES.ResponsePDU, 
            obj.pdu.reqid,
            0,
            0,
            generateFakeVarBinds(obj)
        ));
    }
    
    cb(null,snmp.encode(response,snmp.ENCODING_RULES.BER));
}

/**
 * Create fake VarBinds for a fake community
 * Needs improvement
 * @param {SNMPPacket} request
 */
function generateFakeVarBinds(request){
    return request.pdu.varBinds || [new VarBind()];
}