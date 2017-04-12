const express = require('express');
const router = express.Router();
const userSchema = require('../models/user');
const deviceSchema = require('../models/device');
const snmpAgentSchema = require('../models/snmp_agent');
const agentController = require('../controllers/snmpagents');
const deviceController = require('../controllers/devices');
/* GET API home page */
router.get('/', function(req, res, next) {
    //Return version=1 in json
  res.jsonp({
      'v' : '1' 
  });
});
router.route('/agents')
    .get(agentController.findAllSNMPAgents)
    .post(agentController.addSNMPAgent);
    
router.route('/agent/:id')
    .get(agentController.findSNMPAgentById)
    .put(agentController.updateSNMPAgent)
    .delete(agentController.deleteSNMPAgent);

router.route('/devices')
    .get(deviceController.findAllDevices)
    .post(deviceController.addDevice);
    
router.route('/device/:id')
    .get(deviceController.findDeviceById)
    .put(deviceController.updateDevice)
    .delete(deviceController.deleteDevice);

router.get('/user/:id', function(req, res, next) {
    if(req.param.id && req.param.id != ''){
        userSchema.findOne({'local.username' : req.param.id},(err,doc)=>{
            if(err) res.status(500,err.message);
            res.status(200).jsonp(doc);
        });
    }else{
        userSchema.find({},(err,doc)=>{
            if(err) res.status(500,err.message);
            res.status(200).jsonp(doc);
        });
    }
});
module.exports = router;
