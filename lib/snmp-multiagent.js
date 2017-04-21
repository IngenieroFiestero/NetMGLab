const cluster = require('cluster');
const cp = require('child_process');
const SNMPAgentModel = require('../models/snmp_agent');
const SNMPAgent = require('./snmp-agent');
const os = require('os');
const windows = os.platform() == 'win32';
/*
 * Ejemplo comando:
 * { cmd : "spawnSNMP",
 *   snmpAgentID : _id}
 * El usuario configura primero el agente SNMP desde la web, luego lo guarda y cuando le da al boton de lanzar el worker se encarga del resto.
 * Al ser un comando para lanzar un nuevo servidor SNMP en todos los procesos se debera 
 * buscar en la base de datos el ID del agente SNMP y lanzarlo siguiendo las caracteristicas.
 */

/*
 * Comandos que se tienen que transmitir de uno a otro:
 * En un worker un usuario http configura un nuevo agente snmp en el puerto X.
 * El worker manda un mensaje al master de nuevo agente snmp.
 * El master lo añade a la lista de agentes snmp y retransmite la lista.
 * El resto de workers comprueban cada uno de los agentes que tienen.
 */

/*
 * Toda la logica de lanzar un servidor SNMP se maneja desde este script
 * launch(id) : Lanzar agente SNMP. Primero buscar en la base de datos.
 * close(id) : cerrar todos los agentes snmp con id.
 * closeAll() : cerrar todos los agentes snmp.
 */
const REQUEST_LAUNCH_SNMP_AGENT = 0;//Un worker pide al master lanzar un agente SNMP
const COMMAND_LAUNCH_SNMP_AGENT = 1;//El master informa a los workers de que deben lanzar un nuevo agente SNMP
const REQUEST_STOP_SNMP_AGENT = 2;//Un worker pide al master parar un agente SNMP
const COMMAND_STOP_SNMP_AGENT = 3;//El master informa a los workers de que deben PARAR un agente SNMP
const REQUEST_STOP_ALL_SNMP_AGENTS = 4;//Un worker pide al master parar TODOS los agentes SNMP
const COMMAND_STOP_ALL_SNMP_AGENTS = 5;//El master informa a los workers de que deben PARAR TODOS los agentes SNMP
const REQUEST_UPDATE_SNMP_AGENT = 6;//Un worker pide al master parar TODOS los agentes SNMP
const COMMAND_UPDATE_SNMP_AGENT = 7;//El master informa a los workers de que deben PARAR TODOS los agentes SNMP


/**
 * This intends to be a SNMP agent spawner for multi-processing.
 * If you want a SNMP agent on port 161 and while running you add another running on port 162 
 * you need to spawn the agent on each of the child processes.
 */
exports.init = function () {
    if (cluster.isMaster) {
        process.SNMPAgentList = [];//Lista que tendran todos los procesos con los agentes que estan funcionando
        cluster.on('fork', configWorker);
    } else {
        configWorker();
    }
}
/**
 * Configure worker to recibe messages from master
 */
function configWorker(worker) {
    if (worker) {
        //Configurar el master
        worker.on('message', messageFromWorker);
    } else {
        //Configuracion del hijo
        process.SNMPAgentList = [];//Lista que tendran todos los procesos con los agentes que estan funcionando
        process.on('message', messageFromMaster);
    }
}
/**
 * Master recives a message from worker
 */
function messageFromWorker(msg) {
    if (msg && "cmd" in msg && "data" in msg) {
        if (msg.cmd == REQUEST_LAUNCH_SNMP_AGENT && msg.data.agentID) {//-------------------------------------------------- LAUNCH a SNMP Agent in all the processes
            //Buscando el agente SNMP en la base de datos
            SNMPAgentModel.findOne({ _id: msg.data.agentID }, (err, snmp_agent) => {
                if (!err) {
                    const included = false;
                    for (var i = 0; i < process.SNMPAgentList.length && !included; i++) {
                        if (msg.data.name === process.SNMPAgentList[i].name) {
                            included = true;
                            break;
                        }
                    }
                    if (!included) {//Si no esta incluido en la lista lo añadimos
                        process.SNMPAgentList.push(snmp_agent);
                    }
                    if (windows && !included) {
                        //Windows only supports 1 UDP socket on 1 port at a time
                        var max = 0;
                        for (var id in cluster.workers) {
                            max = id;
                        }
                        var value = Math.round(Math.random() * (max - 1) + 1);
                        cluster.workers[value + ''].send({
                            cmd: COMMAND_LAUNCH_SNMP_AGENT,
                            data: snmp_agent
                        });
                    } else {
                        //Always send to the workers the agent
                        for (var id in cluster.workers) {
                            cluster.workers[id].send({
                                cmd: COMMAND_LAUNCH_SNMP_AGENT,
                                data: snmp_agent
                            });
                        }
                    }
                }
            });
        } else if (msg.cmd === REQUEST_STOP_SNMP_AGENT && msg.data.agentName) {//------------------------------------------- STOP a SNMP Agent in all the processes
            const included = false;
            for (var i = 0; i < process.SNMPAgentList.length && !included; i++) {
                if (msg.data.name === process.SNMPAgentList[i].name) {
                    included = true;
                    process.SNMPAgentList.splice(i, 1);//Remove the agent from the list
                }
            }
            //Always send the agent to the workers 
            for (var id in cluster.workers) {
                cluster.workers[id].send({
                    cmd: COMMAND_STOP_SNMP_AGENT,
                    data: msg.data.agentName
                });
            }
        } else if (msg.cmd === REQUEST_STOP_ALL_SNMP_AGENTS) {//------------------------------------------------------------ STOP ALL SNMP Agents in all the processes
            process.SNMPAgentList.splice(0, process.SNMPAgentList.length);//Eliminar todos los elementos del array
            for (var id in cluster.workers) {
                cluster.workers[id].send({
                    cmd: COMMAND_STOP_ALL_SNMP_AGENTS,
                    data: {}
                });
            }
        } else if (msg.cmd === REQUEST_UPDATE_SNMP_AGENT && msg.data.agentID) {//------------------------------------------- UPDATE a SNMP Agent in all the processes
            SNMPAgentModel.findOne({ _id: msg.data.agentID }, (err, snmp_agent) => {
                if (!err) {
                    const included = false;
                    for (var i = 0; i < process.SNMPAgentList.length && !included; i++) {
                        if (msg.data.name === process.SNMPAgentList[i].name) {
                            included = true;
                            break;
                        }
                    }
                    if (!included) {//Si no esta incluido en la lista lo añadimos
                        process.SNMPAgentList.push(snmp_agent);
                    }
                    for (var id in cluster.workers) {
                        cluster.workers[id].send({
                            cmd: COMMAND_UPDATE_SNMP_AGENT,
                            data: snmp_agent
                        });
                    }
                }
            });
        }
    }
}
/**
 * Worker recives a message from master
 */
function messageFromMaster(msg) {
    if (msg.cmd && msg.data) {
        if (msg.cmd === COMMAND_LAUNCH_SNMP_AGENT && msg.data != {}) {//------------------------------------------------------  LAUNCH new SNMP Agent
            const included = false;
            for (var i = 0; i < process.SNMPAgentList.length && !included; i++) {
                if (msg.data.name === process.SNMPAgentList[i].name) {
                    included = true;
                    break;
                }
            }
            if (!included) {
                var agente = msg.data;
                try {//In windows we cant share udp ports
                    agente.agent = new SNMPAgent(msg.data);//Save the Agent that listens in a socket
                    agente.agent.start();
                    process.SNMPAgentList.push(agente);
                } catch (err) { }
            }
        } else if (msg.cmd === COMMAND_STOP_SNMP_AGENT && typeof msg.data === 'string') {//------------------------------------ STOP SNMP Agent
            for (var i = 0; i < process.SNMPAgentList.length; i++) {
                if (msg.data === process.SNMPAgentList[i].name) {
                    process.SNMPAgentList[i].agent.stop();//Stop the SNMP Agent
                    process.SNMPAgentList.splice(i, 1);//Delete SNMP Agent from list
                    break;
                }
            }
        } else if (msg.cmd === COMMAND_STOP_ALL_SNMP_AGENTS) {//------------------------------------ STOP ALL SNMP Agent
            for (var i = 0; i < process.SNMPAgentList.length; i++) {
                process.SNMPAgentList[i].agent.stop();//Stop the SNMP Agent
            }
            process.SNMPAgentList.splice(0, process.SNMPAgentList.length);//Delete all the SNMP Agents
        } else if (msg.cmd === COMMAND_UPDATE_SNMP_AGENT) {//------------------------------------ STOP ALL SNMP Agent
            for (var i = 0; i < process.SNMPAgentList.length; i++) {
                if (process.SNMPAgentList[i]._id == msg.data._id) {
                    process.SNMPAgentList[i].agent.updateAgent(msg.data, () => {
                        console.log('Agent Updated');
                    });
                }
            }
        }
    }

}


/**
 * Launch an SNMP Agent in all the processes.
 * Called from the worker.
 * @param {"Schema.ObjectId"} id -  MongoDB id for finding it
 */
exports.launchSNMPAgent = function (id) {
    if (cluster.isMaster) {
        messageFromWorker({
            cmd: REQUEST_LAUNCH_SNMP_AGENT,
            data: {
                agentID: id
            }
        });
    } else {
        process.send({
            cmd: REQUEST_LAUNCH_SNMP_AGENT,
            data: {
                agentID: id
            }
        });
    }
}
/**
 * Stops an SNMP Agent in all the processes.
 * Called from the worker.
 * @param {String} name -  The name of the agent
 */
exports.stopSNMPAgent = function (name) {
    process.send({
        cmd: REQUEST_STOP_SNMP_AGENT,
        data: {
            agentName: name
        }
    });
}
/**
 * Update a SNMP Agent in all the processes.
 * Called from the worker.
 * @param {String} id -  The ID of the agent
 */
exports.updateSNMPAgent = function (id) {
    process.send({
        cmd: REQUEST_UPDATE_SNMP_AGENT,
        data: {
            agentID: id
        }
    });
}
/**
 * Stops all the SNMP Agents in all the processes.
 * Called from the worker.
 */
exports.stopALLSNMPAgents = function () {
    process.send({
        cmd: REQUEST_STOP_ALL_SNMP_AGENTS,
        data: {}
    });
}
