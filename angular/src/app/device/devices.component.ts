import { Component ,OnInit } from '@angular/core'
import { DeviceDetailComponent } from './device-detail.component'
import {Device} from './device'
import {DeviceService} from './device.service'
@Component({
  selector: 'my-devices',
  templateUrl : './devices.component.html'
})
export class DevicesComponent implements OnInit{ 
  selectedDevice : Device;
  devices : Device[];
  constructor(private deviceService: DeviceService) { }
  ngOnInit(): void {
    this.getDevices();
  }
  getDevices(): void {
    this.deviceService.getDevices().then(devices => this.devices = devices);
  }
  onSelect(device: Device): void {
    this.selectedDevice = device;
  }
}
