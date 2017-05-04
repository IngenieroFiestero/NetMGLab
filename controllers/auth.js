const userSchema = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
/**
 * Find user by ID. Use like middleware in ExpressJS
 */
exports.authenticateUser = (req, res, next) => {
    if (req.params.username && req.params.username != '' && req.params.password && req.params.password != '') {
        userSchema.findOne({ 'local.username': req.params.username }, (err, doc) => {
            if (err) {
                res.status(500).send(err.message);
            } else {
                bcrypt.hash(req.params.password, 10).then(function (hash) {
                    bcrypt.compare(hash, doc.local.password, (err, sucess) => {
                        if (err) {
                            res.status(401).send('Not valid Username');
                        } else if (!sucess) {
                            res.status(401).send('Passwords not match');
                        } else {
                            jwt.sign({ 'username': doc.local.username, 'rol': doc.rol, 'userGroups': doc.userGroups },
                                process.jwtSecret || 'mysecret', { algorithm: 'HS256', expiresIn: 60 * 60 }, (err, token) => {
                                    res.status(200).jsonp({ 'token': token });
                            });
                        }
                    });
                });
            }
        });
    } else {
        res.status(500).send('Not valid Username');
    }
}
/**
 * Middleware for checking if a token is valid
 */
exports.loginUser = (req, res, next) => {
    var token = req.headers.token;
    if (!token) {
       req.user = false;
       next();
    } else {
        jwt.verify(token, process.jwtSecret || 'mysecret', function (err, decoded) {
            if (err) {
                req.user = false;
                next();
            } else {
                req.user = decoded;
                next();
            }
        });
    }
}