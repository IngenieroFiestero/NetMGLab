var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;

var MibNodeSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    description : String,
    oid : {
        type : String,
        required : true,
        unique : true
    },
    module : {
        type : String,
        required : true
    },
    maxAccess : {
        type : String,
        default : "read-write",
        enum : ["read-write", "read-only","not-accessible"]
    },
    status : {
        type : String,
        default : "mandatory",
        enum: ["mandatory"]
    },
    syntax : {
        type : String,
        default : "ObjectID",

    }
});

module.exports = mongoose.model('MibNode', MibNodeSchema);