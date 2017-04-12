import { Component, Input,OnInit  } from '@angular/core';

import { Device } from './device'

@Component({
  selector: 'device-detail',
  templateUrl: './device-detail.component.html'
})
export class DeviceDetailComponent{
  @Input() device: Device;
}