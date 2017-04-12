const deviceSchema = require('../models/device');
/**
 * Find device by ID. Use like middleware in ExpressJS
 */
exports.findDeviceById = (req, res, next) => {
    if (req.params.id && req.params.id != '') {
        deviceSchema.findOne({ '_id': req.params.id }, (err, doc) => {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.status(200).jsonp(doc);
            }
        });
    } else {
        res.status(500).send('Not valid ID');
    }
}
/**
 * Find All devices. Use like middleware in ExpressJS
 */
exports.findAllDevices = (req, res, next) => {
    deviceSchema.find({}, (err, doc) => {
        if (err) res.status(500).send(err.message);
        res.status(200).jsonp(doc);
    });
}
/**
 * Add a new device. Use like middleware in ExpressJS
 */
exports.addDevice = (req, res, next) => {
    var device = new deviceSchema({
        name: req.body.name,
        description: req.body.description || '',
        ip: req.body.ip,
        port: req.body.port,
        readOnlyCommunity: req.body.readOnlyCommunity || 'public',
        readWriteCommunity: req.body.readWriteCommunity || 'private',
        userGroup: req.body.userGroup || ''
    });

    device.save(function (err, device) {
        if (err) res.status(500).send(err.message);
        res.status(200).jsonp(device);
    });
}
/**
 * Update a existing  device. Use like middleware in ExpressJS
 */
exports.updateDevice = (req, res, next) => {
    console.log('Updating Device: ' + req.params.id);
    deviceSchema.findById(req.params.id, function (err, device) {
        if (err) res.status(500).send(err.message);
        device.name = req.body.name || device.name;
        device.port = req.body.port || device.port;
        device.readOnlyCommunity = req.body.readOnlyCommunity || device.readOnlyCommunity;
        device.readWriteCommunity = req.body.readWriteCommunity || device.readWriteCommunity;
        device.description = req.body.description || device.description;
        device.userGroup = req.body.userGroup  || device.userGroup || '';
        device.save(function (err) {
            if (err) res.status(500).send(err.message);
            res.status(200).jsonp(device);
        });
    });
}
/**
  * Delete a existing  device. Use like middleware in ExpressJS
  */
exports.deleteDevice = (req, res, next) => {
    deviceSchema.findById(req.params.id, (err, device) => {
        if (err) res.status(500).send(err.message);
        device.remove((err) => {
            if (err) res.status(500).send(err.message);
            res.status(200).send();
        });
    });
}