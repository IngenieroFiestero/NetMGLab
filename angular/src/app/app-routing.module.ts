import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SnmpAgentsComponent } from './snmpagent/snmp-agents.component'
import { DashboardComponent } from './dashboard/dashboard.component'
import { DevicesComponent } from './device/devices.component'
import { DeviceEditComponent } from './device/device-edit.component'
import { SnmpAgentEditComponent } from './snmpagent/snmp-agent-edit.component'

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'agents', component: SnmpAgentsComponent },
    { path: 'agent/:id', component: SnmpAgentEditComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'devices', component: DevicesComponent },
    { path: 'device/:id', component: DeviceEditComponent }
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }