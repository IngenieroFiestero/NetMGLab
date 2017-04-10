import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SnmpAgentDetailComponent } from './snmpagent/snmp-agent-detail.component'
import { SnmpAgentsComponent } from './snmpagent/snmp-agents.component'
import { DashboardComponent } from './dashboard/dashboard.component'
import { DevicesComponent } from './device/devices.component'
import { DeviceDetailComponent } from './device/device-detail.component'
import { DeviceService } from './device/device.service'

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
      },
      {
        path: 'devices',
        component: DevicesComponent
      }
    ])
  ],
  declarations: [
    AppComponent,
    SnmpAgentDetailComponent,
    SnmpAgentsComponent,
    DashboardComponent,
    DevicesComponent,
    DeviceDetailComponent
  ],
  bootstrap: [AppComponent],
  providers: [SnmpAgentService,DeviceService]
})
export class AppModule { }
