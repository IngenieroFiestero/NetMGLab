import { Injectable } from '@angular/core';

import { SnmpAgent } from './snmp-agent';

@Injectable()
export class SnmpAgentService {
  getSnmpAgents(): Promise<SnmpAgent[]> {
    return Promise.resolve(SNMP_AGENTS);
  }
}
const SNMP_AGENTS: SnmpAgent[] = [
    { name: 'Agente 007', description: 'A nice snmp agent',port : 161,readOnlyCommunity : 'public',readWriteCommunity : 'private', device : '0' },
    { name: 'Agente 001', description: 'A bad snmp agent',port : 160,readOnlyCommunity : 'public',readWriteCommunity : 'private', device : '1' }
];