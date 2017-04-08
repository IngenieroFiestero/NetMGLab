import { Injectable } from '@angular/core';

import { SnmpAgent } from './snmp-agent';
import { SNMP_AGENTS } from './snmp-agents';

@Injectable()
export class SnmpAgentService {
  getSnmpAgents(): Promise<SnmpAgent[]> {
    return Promise.resolve(SNMP_AGENTS);
  }
}