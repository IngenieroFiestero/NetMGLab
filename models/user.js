var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;
var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

var UserSchema = new Schema({
    local: {
        username: String,
        password: String
    },
    info: {
        email: String,
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
    rol: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    }
});

module.exports = mongoose.model('User', UserSchema);