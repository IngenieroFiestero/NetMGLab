const userSchema = require('../models/user');
const jwt = require('jsonwebtoken');
/**
 * Find user by ID. Use like middleware in ExpressJS
 */
exports.authenticateUser = (req, res, next) => {
    if (req.params.username && req.params.username != '' && req.params.password && req.params.password != '') {
        userSchema.findOne({ 'local.username': req.params.username }, (err, doc) => {
            if (err) {
                res.status(500).send(err.message);
            } else {
                jwt.sign({ 'username': doc.local.username,'rol' :  doc.rol, 'userGroups' : doc.userGroups},
                    process.jwtSecret || 'mysecret', { algorithm: 'HS256', expiresIn: 60 * 60 }, (err, token) => {
                        res.status(200).jsonp({'token' : token});
                });
            }
        });
    } else {
        res.status(500).send('Not valid Username');
    }
}
exports.loginUser = (req, res, next) => {
    var token = info.req.headers.token;
    if (!token) {
        cb(false, 401, 'Unauthorized');
    } else {
        jwt.verify(token, process.jwtSecret || 'mysecret', function (err, decoded) {
            if (err) {
                cb(false, 401, 'Unauthorized');
            } else {
                info.req.user = decoded;
                cb(true);
            }
        });
    }
}