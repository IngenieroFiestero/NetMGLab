import { Component, Input, OnInit } from '@angular/core';

import { SnmpAgent } from './snmp-agent'
import { Device } from '../device/device'
import { SnmpAgentService } from '../snmpagent/snmp-agent.service'

@Component({
    selector: 'agent-new',
    templateUrl: './snmp-agent-new.component.html'
})
export class SnmpAgentNewComponent {
    @Input() agent: SnmpAgent;
    @Input() devices: Device[];
    constructor(private snmpAgentService: SnmpAgentService) { }
    save(): void {
        this.snmpAgentService.postSnmpAgent(this.agent).then(() => this.goBack());
    }
    goBack(): void {
        
    }
}