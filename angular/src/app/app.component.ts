import { Component ,OnInit, EventEmitter } from '@angular/core';
import { SnmpAgentService } from './snmpagent/snmp-agent.service';
import {SnmpAgent} from './snmpagent/snmp-agent'

@Component({
  selector: 'my-app',
  templateUrl : './app.component.html'
})
export class AppComponent{ 
  title ='My SNMP Agents';
}
