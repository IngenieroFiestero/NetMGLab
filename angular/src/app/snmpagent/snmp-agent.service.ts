import { Injectable } from '@angular/core';
import { Headers,RequestOptions, Http } from '@angular/http';
import { SnmpAgent } from './snmp-agent';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class SnmpAgentService {
  private headers = new Headers({ 'Content-Type': 'application/json' });
  constructor(private http: Http) { }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
  getSnmpAgents(): Promise<SnmpAgent[]> {
    return this.http.get('http://127.0.0.1:8000/api/agents')
      .toPromise()
      .then(response => response.json() as SnmpAgent[])
      .catch(this.handleError);
  }
  getSnmpAgent(id: string): Promise<SnmpAgent> {
    const url = `http://127.0.0.1:8000/api/agent/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => response.json() as SnmpAgent)
      .catch(this.handleError);
  }
  postSnmpAgent(agent: SnmpAgent): Promise<SnmpAgent> {
    const url = `http://127.0.0.1:8000/api/agents`;
    return this.http
      .post(url, JSON.stringify(agent), this.jwt())
      .toPromise()
      .then(() => agent)
      .catch(this.handleError);
  }
  updateSnmpAgent(agent: SnmpAgent): Promise<SnmpAgent> {
    const url = `http://127.0.0.1:8000/api/agent/${agent._id}`;
    return this.http
      .put(url, JSON.stringify(agent), this.jwt())
      .toPromise()
      .then(() => agent)
      .catch(this.handleError);
  }
  deleteSnmpAgent(agent: SnmpAgent): Promise<void> {
    const url = `http://127.0.0.1:8000/api/agent/${agent._id}`;
    return this.http
      .delete(url, this.jwt())
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }
  // private helper methods

  private jwt() {
    // create authorization header with jwt token
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      let headers = new Headers({ 'Content-Type': 'application/json','Authorization': 'Bearer ' + currentUser.token });
      return new RequestOptions({ headers: headers });
    }else{
      let headers = new Headers({ 'Content-Type': 'application/json'});
      return new RequestOptions({ headers: headers });
    }
  }
}