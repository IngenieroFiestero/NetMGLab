import { SnmpAgent } from './snmp-agent';
export const SNMP_AGENTS: SnmpAgent[] = [
    { name: 'Agente 007', description: 'A nice snmp agent',port : 161,readOnlyCommunity : 'public',readWriteCommunity : 'private' },
    { name: 'Agente 001', description: 'A bad snmp agent',port : 160,readOnlyCommunity : 'public',readWriteCommunity : 'private' }
];