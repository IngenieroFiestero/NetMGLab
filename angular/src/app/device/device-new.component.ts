import { Component, Input, OnInit } from '@angular/core';

import { Device } from './device'
import { DeviceService } from './device.service'

@Component({
    selector: 'device-new',
    templateUrl: './device-new.component.html'
})
export class DeviceNewComponent {
    @Input() device: Device;
    constructor(private deviceService: DeviceService) { }
    save(): void {
        this.deviceService.postDevice(this.device).then(() => this.goBack());
    }
    goBack(): void {
        this.device = null;
    }
}