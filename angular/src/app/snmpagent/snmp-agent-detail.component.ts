import { Component, Input,OnInit  } from '@angular/core';

import { SnmpAgent } from './snmp-agent'
import { SnmpAgentService } from './snmp-agent.service'
@Component({
  selector: 'agent-detail',
  templateUrl: './snmp-agent-detail.component.html'
})
export class SnmpAgentDetailComponent{
  @Input() agent: SnmpAgent;
}