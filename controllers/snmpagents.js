const snmpAgentSchema = require('../models/snmp_agent');
const SNMPMultiAgent = require('../lib/snmp-multiagent');
/**
 * Find SNMP agent by ID. Use like middleware in ExpressJS
 */
exports.findSNMPAgentById = (req, res, next) => {
    if (req.params.id && req.params.id != '') {
        snmpAgentSchema.findOne({ '_id': req.params.id }, (err, doc) => {
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
 * Find All SNMP agents. Use like middleware in ExpressJS
 */
exports.findAllSNMPAgents = (req, res, next) => {
    snmpAgentSchema.find({}, (err, doc) => {
        if (err) res.status(500).send(err.message);
        res.status(200).jsonp(doc);
    });
}
/**
 * Add a new SNMP agent. Use like middleware in ExpressJS
 */
exports.addSNMPAgent = (req, res, next) => {
    var snmpAgent = new snmpAgentSchema({
        name: req.body.name,
        port: req.body.port,
        device: req.body.device || null,
        readOnlyCommunity: req.body.readOnlyCommunity || 'public',
        readWriteCommunity: req.body.readWriteCommunity || 'private',
        description: req.body.description || '',
        userGroup: req.body.userGroup || ''
    });

    snmpAgent.save(function (err, agente) {
        if (err) res.status(500).send(err.message);
        SNMPMultiAgent.launchSNMPAgent(agente._id);
        res.status(200).jsonp(agente);
    });
}
/**
 * Update a existing SNMP  Agent. Use like middleware in ExpressJS
 */
exports.updateSNMPAgent = (req, res, next) => {
    var changeAgent = false;
    var update = {};
    if(req.body.name){
        update.name = req.body.name;
    }
    if(req.body.port){
        update.port = req.body.port;
        changeAgent = true;
    }
    if(req.body.device){
        update.device = req.body.device;
        changeAgent = true;
    }
    if(req.body.readOnlyCommunity){
        update.readOnlyCommunity = req.body.readOnlyCommunity;
        changeAgent = true;
    }
    if(req.body.readWriteCommunity){
        update.readWriteCommunity = req.body.readWriteCommunity;
        changeAgent = true;
    }
    if(req.body.description){
        update.description = req.body.description;
    }
    if(req.body.userGroup){
        update.userGroup = req.body.userGroup;
        changeAgent = true;
    }
    snmpAgentSchema.findOneAndUpdate({ _id : req.params.id}, update,{}, function (err, doc) {
        if (err) {
            console.log(err);
            res.status(500).send(err.message);
        } else {
            if(changeAgent){
                SNMPMultiAgent.updateSNMPAgent(doc._id);
            }
            res.status(200).jsonp(doc);
        }
    });
}
/**
  * Delete a existing SNMP  Agent. Use like middleware in ExpressJS
  */
exports.deleteSNMPAgent = (req, res, next) => {
    snmpAgentSchema.findById(req.params.id, (err, agent) => {
        if (err) res.status(500).send(err.message);
        agent.remove((err) => {
            if (err) res.status(500).send(err.message);
            res.status(200).send();
        });
    });
}






exports.findSNMPAgentByName = function (req, res, next) {
    if (req.param.name && req.param.name != '') {
        snmpAgentSchema.findOne({ 'name': req.param.id }, (err, doc) => {
            if (err) res.status(500, err.message);
            res.status(200).jsonp(doc);
        });
    } else {
        res.status(500, 'Not valid name');
    }
}
