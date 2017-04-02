const cluster = require('cluster');
/**
 * This intends to be a SNMP server spawner for multi-processing.
 * If you want a SNMP server in port 161 and while running you add another running in port 162 
 * you need to spawn theserver in each of the child processes.
 */
module.exports = function(){
    if(cluster.isMaster){
        for (const id in cluster.workers) {
            cluster.workers[id].on('message', workerMessage);
            cluster.on('fork',configWorker);
        }
    }else{
        //process.send({ cmd: 'notifyRequest' });
        configWorker(process);
    }
}
/**
 * Configure worker to recibe messages from master
 */
var configWorker = function(worker){

}
/**
 * Master recibes a message from worker
 */
var workerMessage = function(msg){

}
/**
 * Comandos que se tienen que transmitir de uno a otro:
 * En un worker un usuario http configura un nuevo agente snmp en el puerto X.
 * El worker manda un mensaje al master de nuevo agente snmp.
 * El master lo añade a la lista de agentes snmp y retransmite la lista.
 * El resto de workers comprueban cada uno de los agentes que tienen.
 */