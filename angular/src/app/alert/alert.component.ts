import { Component, OnInit } from '@angular/core';

import { Alert } from './alert'
import { AlertService } from './alert.service';

@Component({
    selector: 'alert-list',
    templateUrl: './alert.component.html'
})
export class AlertComponent {
    alerts: Alert[];
    constructor(
        private alertService: AlertService
    ) { }
    getAlerts(): void {
        this.alertService.getAlerts().then(alerts => this.alerts = alerts);
    }
    ngOnInit(): void {
        this.getAlerts();
    }

}