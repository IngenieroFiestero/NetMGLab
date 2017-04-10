"use strict";
const constants = require('./constants');
const PDU_TYPES = constants.PDU_TYPES;
const VarBind = require('./varbinds');
class PDU {
    /**
     * The PDU contains the SNMP request/response and the VarBinds
     * @param {Number} type
     * @param {Number} reqid
     * @param {Number} error
     * @param {Number} errorIndex
     * @param {VarBind} varBinds
     */
    constructor(type, reqid, error, errorIndex, varBinds) {
        this.type = type || PDU_TYPES.GetRequestPDU;
        this.reqid = reqid || 1;
        this.error = error || 0;
        this.errorIndex = errorIndex || 0;
        this.varBinds = varBinds || [new VarBind()];
    }
}
module.exports = PDU;