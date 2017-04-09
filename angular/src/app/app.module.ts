import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SnmpAgentDetailComponent } from './snmpagent/snmp-agent-detail.component'
import { SnmpAgentsComponent } from './snmpagent/snmp-agents.component'
import { DashboardComponent } from './dashboard/dashboard.component'

import { SnmpAgentService } from './snmpagent/snmp-agent.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'agents',
        component: SnmpAgentsComponent
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      }
    ])
  ],
  declarations: [
    AppComponent,
    SnmpAgentDetailComponent,
    SnmpAgentsComponent,
    DashboardComponent
  ],
  bootstrap: [AppComponent],
  providers: [SnmpAgentService]
})
export class AppModule { }
