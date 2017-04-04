const cluster = require('cluster');
const snmpMultiServer = require('../lib/SNMPMultiServer');
const mongoose = require('mongoose');
const config = require('../config');
const readline = require('readline');
const SNMPAgentModel = require('../models/snmp_agent');
const os = require('os');
var windows = os.platform() == 'win32';



/**
 * snmpget -v 2c -c public 127.0.0.1 .1.3.6.1.2.1.1.4.0
 */
if (cluster.isMaster) {
    var db = mongoose.connect(config.db.uri);
    mongoose.connection.once('connected', function () {
        SNMPAgentModel.findOne({ port: 161 }, (err, doc) => {
            if (err) {
                var newAgent = new SNMPAgentModel();
                newAgent.port = 161;
                newAgent.name = "Pepe Botella";
                newAgent.readOnlyCommunity = "public";
                newAgent.readWriteCommunity = "private";
                newAgent.device = mongoose.Types.ObjectId();
                newAgent.save((err, doc) => {
                    var id;
                    if (err) { } else {
                        console.log("New agent created");
                        console.log(newAgent);
                        //We are the master
                        for (var i = 0; i < 2; i++) {
                            var worker = i == 0 ? cluster.fork({ lector: true, mongoid: newAgent._id }) : cluster.fork();
                            process.lector = worker.process.pid;
                        }
                        cluster.on('exit', function (worker, code, signal) {
                            //If a child dies spawn another
                            console.log("Error1: " + code);
                            console.log(worker);
                            if (worker.process.pid == process.lector) {
                                var worker = cluster.fork({ lector: true, mongoid: newAgent._id });
                                process.lector = worker.process.pid;
                            }
                        });
                        snmpMultiServer.init();
                    }
                });
            } else {
                for (var i = 0; i < 2; i++) {
                    var worker = i == 0 ? cluster.fork({ lector: true, mongoid: doc._id }) : cluster.fork();
                    process.lector = worker.process.pid;
                }
                cluster.on('exit', function (worker, code, signal) {
                    //If a child dies spawn another
                    console.log("Error2: " + code);
                    console.log(worker.process.pid + " - " + process.lector);
                    if (worker.process.pid == process.lector) {
                        var worker = cluster.fork({ lector: true, mongoid: doc._id });
                        process.lector = worker.process.pid;
                    }
                });
                snmpMultiServer.init();
            }
        });

    });

} else {
    snmpMultiServer.init();
    var db = mongoose.connect(config.db.uri);
    mongoose.connection.once('connected', function () {
        //Each child connects to mongo and reuses the connection
        console.log('New worker: ' + process.pid);
        if (process.env.lector) {
            console.log("Somos el lector");
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
                    snmpMultiServer.launchSNMPAgent(process.env.mongoid);
                }
            });
        }
        console.log("Connected to database");
    });

}