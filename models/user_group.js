var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;

var UserGroupSchema = new Schema({
    name : {
        type : String,
        required = true,
        unique : tru
    },
    description : {
        type : String
    },
    snmpAgentList : [Schema.ObjectId]
});
UserGroupSchema.path('description').validate(function (v) {
    return v.length < 160;
});
module.exports = mongoose.model('UserGroup', UserGroupSchema);