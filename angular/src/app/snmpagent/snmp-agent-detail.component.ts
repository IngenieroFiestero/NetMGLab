import { Component, Input,OnInit  } from '@angular/core';

import { SnmpAgent } from './snmp-agent'
import { Device } from '../device/device'
import { DeviceService } from '../device/device.service'
@Component({
  selector: 'agent-detail',
  templateUrl: './snmp-agent-detail.component.html'
})
export class SnmpAgentDetailComponent implements  OnInit{
  @Input() agent: SnmpAgent;
  devices: Device[];
  constructor(private deviceService: DeviceService) { }
  ngOnInit(): void {
    this.getDevices();
  }
  getDevices(): void {
    this.deviceService.getDevices().then(devices => this.devices = devices);
  }
}