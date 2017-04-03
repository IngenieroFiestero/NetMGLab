const cluster = require('cluster');
const snmpMultiServer = require('../lib/SNMPMultiServer');
const mongoose = require('mongoose');
const config = require('../config');
const readline = require('readline');
const SNMPAgentModel = require('../models/snmp_agent');
const os = require('os');
var windows = os.platform() == 'win32';

if(windows){
    console.log("Multiprocessing udp not implemented yet");
}
if (cluster.isMaster) {
    var db = mongoose.connect(config.db.uri);
    mongoose.connection.once('connected', function () {
        var newAgent = new SNMPAgentModel();
        newAgent.port = 161;
        newAgent.name = "Pepe Botella";
        newAgent.readOnlyCommunity = "public";
        newAgent.readWriteCommunity = "private";
        newAgent.device = mongoose.Types.ObjectId();
        newAgent.save((err, doc) => {
            if (err) {
                console.log(err);
            } else {
                console.log("New agent created");
                console.log(newAgent);
            }
        });
    });
    //We are the master
    for (var i = 0; i < 2; i++) {
        var worker = i == 0 ? cluster.fork({lector : true}) : cluster.fork();
        cluster.on('exit', function (worker, code, signal) {
            //If a child dies spawn another
            console.log("Error: " + code);
        });
    }
    snmpMultiServer.init();
} else {
    snmpMultiServer.init();
    var db = mongoose.connect(config.db.uri);
    mongoose.connection.once('connected', function () {
        //Each child connects to mongo and reuses the connection
        console.log('New worker: ' + process.pid);
        if (process.env.lector) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.on('line', (input) => {
                if (input == "stop") {
                    console.log("Sending stop");
                    snmpMultiServer.stopALLSNMPAgents();
                }
            });
            rl.on('line', (input) => {
                if (input == "launch") {
                    console.log("Sending Launch");
                    snmpMultiServer.launchSNMPAgent(mongoose.Types.ObjectId("58e2b48e765b35261001554d"));
                }
            });
        }
        console.log("Connected to database");
    });

}