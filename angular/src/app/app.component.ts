import { Component ,OnInit } from '@angular/core';
import { SnmpAgentService } from './snmpagent/snmp-agent.service';
import { AlertService } from './alert/alert.service';
import {SnmpAgent} from './snmpagent/snmp-agent'
import {Alert} from './alert/alert'
@Component({
  selector: 'my-app',
  templateUrl : './app.component.html'
})
export class AppComponent implements OnInit{ 
  selectedAgent : SnmpAgent;
  constructor(private snmpAgentService: SnmpAgentService,private alertService : AlertService) { }
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
