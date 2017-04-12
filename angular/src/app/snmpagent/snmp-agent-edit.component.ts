import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';

import { SnmpAgent } from './snmp-agent'
import { SnmpAgentService } from './snmp-agent.service'
import { Device } from '../device/device'
import { DeviceService } from '../device/device.service'
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'agent-edit',
  templateUrl: './snmp-agent-edit.component.html'
})
export class SnmpAgentEditComponent implements OnInit {
  private devices: Device[];
  private agent: SnmpAgent;
  constructor(
    private snmpAgentService: SnmpAgentService,
    private deviceService: DeviceService,
    private route: ActivatedRoute,
    private location: Location
  ) { }
  ngOnInit(): void {
    this.deviceService.getDevices().then(devices => this.devices = devices);
    this.route.params
      .switchMap((params: Params) => this.snmpAgentService.getSnmpAgent(params['id']))
      .subscribe(agent => this.agent = agent);
  }
  goBack(): void {
    this.location.back();
  }
  save(): void {
        this.snmpAgentService.updateSnmpAgent(this.agent).then(() => this.goBack());
    }
}