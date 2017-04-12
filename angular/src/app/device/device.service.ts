import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Device } from './device';

@Injectable()
export class DeviceService {
  private headers = new Headers({ 'Content-Type': 'application/json' });
  constructor(private http: Http) { }
  getDevices(): Promise<Device[]> {
    return this.http.get('http://127.0.0.1:8000/api/devices')
      .toPromise()
      .then(response => response.json() as Device[])
      .catch(this.handleError);
  }
  getDevice(id: string): Promise<Device> {
    const url = `http://127.0.0.1:8000/api/device/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json() as Device)
      .catch(this.handleError);
  }
  postDevice(device: Device): Promise<Device> {
    const url = `http://127.0.0.1:8000/api/devices`;
    return this.http
      .post(url, JSON.stringify(device), { headers: this.headers })
      .toPromise()
      .then(() => device)
      .catch(this.handleError);
  }
  updateDevice(device: Device): Promise<Device> {
    const url = `http://127.0.0.1:8000/api/device/${device._id}`;
    return this.http
      .put(url, JSON.stringify(device), { headers: this.headers })
      .toPromise()
      .then(() => device)
      .catch(this.handleError);
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}