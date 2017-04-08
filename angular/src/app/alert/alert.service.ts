import { Injectable } from '@angular/core';
import { Alert } from './alert';

import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

export enum AlertEventType {
  ADD,
  CLEAR,
  CLEAR_ALL
}
export class AlertEvent {
    constructor(public type:AlertEventType, public value?:any) {}
}

@Injectable()
export class AlertService {
      
    alerts : Alert[];
    eventSource: Subject<AlertEvent> = new Subject<AlertEvent>();
    events: Observable<AlertEvent> = this.eventSource.asObservable();
    getAlerts(): Promise<Alert[]> {
        return Promise.resolve(this.alerts);
    }
    addAlert(alert : Alert){
        this.alerts.push(alert);
        setTimeout(() => this.alerts.pop(), 2000);
    }
}