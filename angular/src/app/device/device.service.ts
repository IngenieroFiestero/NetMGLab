import { Injectable } from '@angular/core';

import { Device,SNMPDevice } from './device';

@Injectable()
export class DeviceService {
  getDevices(): Promise<Device[]> {
    return Promise.resolve(DEVICES);
  }
}
const DEVICES: Device[] = [
    {id:'0', name: 'Device1', description: 'A nice snmp agent',ip : '127.0.0.1',snmp : {port : 160,readOnlyCommunity : 'public',readWriteCommunity : 'private'}},
    {id : '1', name: 'Test', description: 'A bad snmp agent',ip : 'localhost', snmp : {port : 160,readOnlyCommunity : 'public',readWriteCommunity : 'private'}}
];