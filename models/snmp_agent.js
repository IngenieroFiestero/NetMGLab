var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;

/**
 * port : Port where SNMP Agent will listen.
 * device : Real device. The admin is the only one who can manage devices.
 * readOnlyCommunity : The community where users can only read.
 * readWriteCommunity : The community where users can read and write.
 * description: Text to facilitate understanding.
 * name : The name for this SNMP agent.
 * userGroup: Which users can manage this agent.
 * mibList : The MIBs availables.
 */
var SNMPAgentSchema = new Schema({
    port : {
        type : Number,
        unique : true,
        required : true
    },
    device : {
        type : Schema.ObjectId,
        required : true
    },
    readOnlyCommunity : {
        type : String,
        required : true
    },
    readWriteCommunity : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : false
    },
    name : {
        type : String,
        required : true,
        unique : true
    },
    userGroup : {
        type : String,
        default : "public"
    },
    mibModuleList : [Schema.ObjectId]
});

module.exports = mongoose.model('SNMPAgent', SNMPAgentSchema);