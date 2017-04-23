import { Injectable } from '@angular/core';
import { Headers, RequestOptions, Http } from '@angular/http';
import { Device } from './device';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class DeviceService {
  constructor(private http: Http, private alertService: AlertService) { }
  getDevices(): Promise<Device[]> {
    return this.http.get('http://127.0.0.1:8000/api/devices', this.jwt())
      .toPromise()
      .then(response => response.json() as Device[])
      .catch((error) => {
        this.alertService.error(error._body);
        return Promise.reject(error.message || error);
      });
  }
  getDevice(id: string): Promise<Device> {
    const url = `http://127.0.0.1:8000/api/device/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json() as Device)
      .catch((error) => {
        this.alertService.error(error._body);
        return Promise.reject(error.message || error);
      });
  }
  postDevice(device: Device): Promise<Device> {
    const url = `http://127.0.0.1:8000/api/devices`;
    return this.http
      .post(url, JSON.stringify(device), this.jwt())
      .toPromise()
      .then(() => device)
      .catch((error) => {
        this.alertService.error(error._body);
        return Promise.reject(error.message || error);
      });
  }
  updateDevice(device: Device): Promise<Device> {
    const url = `http://127.0.0.1:8000/api/device/${device._id}`;
    return this.http
      .put(url, JSON.stringify(device), this.jwt())
      .toPromise()
      .then(() => device)
      .catch((error) => {
        this.alertService.error(error._body);
        return Promise.reject(error.message || error);
      });
  }
  deleteDevice(device: Device): Promise<void> {
    const url = `http://127.0.0.1:8000/api/device/${device._id}`;
    return this.http
      .delete(url, this.jwt())
      .toPromise()
      .then(() => null)
      .catch((error) => {
        this.alertService.error(error._body);
        return Promise.reject(error.message || error);
      });
  }
  // private helper methods

  private jwt() {
    // create authorization header with jwt token
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + currentUser.token });
      return new RequestOptions({ headers: headers });
    } else {
      let headers = new Headers({ 'Content-Type': 'application/json' });
      return new RequestOptions({ headers: headers });
    }
  }
}