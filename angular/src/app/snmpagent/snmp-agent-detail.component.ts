import { Component, Input,OnInit  } from '@angular/core';

import { SnmpAgent } from './snmp-agent'
import { Device } from '../device/device'

@Component({
  selector: 'agent-detail',
  templateUrl: './snmp-agent-detail.component.html'
})
export class SnmpAgentDetailComponent{
  @Input() agent: SnmpAgent;
  @Input() device : Device;
}