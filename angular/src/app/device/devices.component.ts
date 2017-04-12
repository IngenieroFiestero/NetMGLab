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
  myNewDevice : Device;
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
    this.myNewDevice = null;
  }
  newDevice() : void {
    this.myNewDevice = new Device({ id: '0', name: 'Device1', description: 'A nice snmp agent', ip: '127.0.0.1', port: 160, readOnlyCommunity: 'public', readWriteCommunity: 'private' });
    this.selectedDevice = null;
  }
}
