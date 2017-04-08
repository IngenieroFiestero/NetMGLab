import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

import { SnmpAgentDetailComponent } from './snmpagent/snmp-agent-detail.component'
import { AlertComponent } from './alert/alert.component'

import { SnmpAgentService } from './snmpagent/snmp-agent.service';
import { AlertService } from './alert/alert.service';
@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    SnmpAgentDetailComponent,
    AlertComponent
  ],
  bootstrap: [AppComponent],
  providers: [SnmpAgentService, AlertService]
})
export class AppModule { }
