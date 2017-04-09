const SNMPMultiAgent = require('../lib/snmp-multiagent');
const assert = require('assert');
const snmp = require('../lib/snmp');
const dgram = require('dgram');
const cluster = require('cluster');

describe('SNMP MULTI-AGENT', function () {

    if (cluster.isMaster) {
        var worker = cluster.fork();
        cluster.on('exit', function (worker, code, signal) {
            //If a child dies spawn another
            console.log("Error: " + code)
            worker = cluster.fork();
        });
        SNMPMultiAgent.init();
        describe('#iniMaster()', function () {
            it('should create process.SNMPAgentList = []', function () {
                assert.ok(process.SNMPAgentList instanceof Array && (cluster.isMaster));
            });
        });
        describe('#worker forked()', function () {
            it('slow method waits to the fork', function (done) {
                cluster.on('fork', (worker) => {
                    done();
                });
            });
        });

    } else {
        SNMPMultiAgent.init();
        describe('#iniWorker()', function () {
            it('slow method, needs to fork a process...', function (done) {
                if(process.SNMPAgentList instanceof Array && !(cluster.isMaster)){
                    done();
                }
            });
        });
    }
});