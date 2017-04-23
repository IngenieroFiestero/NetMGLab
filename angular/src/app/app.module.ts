import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { SnmpAgentDetailComponent } from './snmpagent/snmp-agent-detail.component'
import { SnmpAgentEditComponent } from './snmpagent/snmp-agent-edit.component'
import { SnmpAgentNewComponent } from './snmpagent/snmp-agent-new.component'
import { SnmpAgentsComponent } from './snmpagent/snmp-agents.component'
import { DashboardComponent } from './dashboard/dashboard.component'
import { DevicesComponent } from './device/devices.component'
import { DeviceDetailComponent } from './device/device-detail.component'
import { DeviceEditComponent } from './device/device-edit.component'
import { DeviceNewComponent } from './device/device-new.component'
import { AlertComponent } from './alert/alert.component';

import { DeviceService } from './device/device.service'
import { SnmpAgentService } from './snmpagent/snmp-agent.service';
import { AlertService } from './alert/alert.service';
import { AuthenticationService } from './auth/authentication.service';
import { AuthGuard } from './auth/auth.guard';

//import { BsDropdownModule,TooltipModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    AppRoutingModule//,
    //BsDropdownModule.forRoot(),
    //TooltipModule
  ],
  declarations: [
    AppComponent,
    SnmpAgentDetailComponent,
    SnmpAgentsComponent,
    DashboardComponent,
    DevicesComponent,
    DeviceDetailComponent,
    DeviceEditComponent,
    SnmpAgentEditComponent,
    SnmpAgentNewComponent,
    DeviceNewComponent,
    AlertComponent
  ],
  bootstrap: [AppComponent],
  providers: [SnmpAgentService,
    DeviceService,
    AuthGuard,
    AlertService,
    AuthenticationService,]
})
export class AppModule { }
