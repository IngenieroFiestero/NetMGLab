var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;

var UserSchema = new Schema({
    local: {
        username: {type : String,
        unique : true},
        password: String
    },
    info: {
        lastConnection: {
            type: Date,
            default: Date.now
        },
        state: {
            type: String,
            enum: ['pending', 'active', 'baned', 'removed'],
            default: 'pending'
        }
    },
    profile: {
        photo: String,
        creationDate: {
            type: Date,
            default: Date.now
        },
        nickname: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    rol: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    userGroups : [Schema.Types.ObjectId]
});
UserSchema.pre('update', function() {
  this.update({},{ $set: { updatedAt: new Date() } });
});
module.exports = mongoose.model('User', UserSchema);