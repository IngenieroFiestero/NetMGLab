import { Component ,OnInit } from '@angular/core'
import { SnmpAgentService } from '../snmpagent/snmp-agent.service'
import {SnmpAgent} from '../snmpagent/snmp-agent'
import { Device } from '../device/device'
import { DeviceService } from '../device/device.service'

@Component({
  selector: 'my-agents',
  templateUrl : './snmp-agents.component.html'
})
export class SnmpAgentsComponent implements OnInit{ 
  selectedAgent : SnmpAgent;
  deviceForAgent : Device;
  newAgent : SnmpAgent;
  constructor(private snmpAgentService: SnmpAgentService, private deviceService: DeviceService) { }
  getDevices(): void {
    this.deviceService.getDevices().then(devices => this.devices = devices);
  }
  ngOnInit(): void {
    this.getAgents();
    this.getDevices();
  }
  agents : SnmpAgent[];
  devices : Device[];
  getAgents(): void {
    this.snmpAgentService.getSnmpAgents().then(agents => this.agents = agents);
  }
  onSelect(agent: SnmpAgent): void {
    this.selectedAgent = agent;
    this.deviceForAgent = this.devices.find(device => device._id === agent.device);
  }
  newSnmpAgent(): void{
    this.newAgent = new SnmpAgent();
  }
}
