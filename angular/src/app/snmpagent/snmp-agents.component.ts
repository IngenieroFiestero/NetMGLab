import { Component ,OnInit } from '@angular/core'
import { SnmpAgentService } from '../snmpagent/snmp-agent.service'
import {SnmpAgent} from '../snmpagent/snmp-agent'
@Component({
  selector: 'my-agents',
  templateUrl : './snmp-agents.component.html'
})
export class SnmpAgentsComponent implements OnInit{ 
  selectedAgent : SnmpAgent;
  constructor(private snmpAgentService: SnmpAgentService) { }
  ngOnInit(): void {
    this.getAgents();
  }
  agents : SnmpAgent[];
  getAgents(): void {
    this.snmpAgentService.getSnmpAgents().then(agents => this.agents = agents);
  }
  onSelect(agent: SnmpAgent): void {
    this.selectedAgent = agent;
  }
}
