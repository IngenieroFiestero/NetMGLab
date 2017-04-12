import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Observer } from "rxjs/Observer";

const URL = 'localhost:8000';


/**
 * This service provide help to mannage the connection with the server across a WebSocket Connection.
 * Its intended to real-time components like graphics, db querys from admin, real-time snmp CLI...
 * 
 * @export
 * @class WSocketService
 */
@Injectable()
export class WSocketService {
    private subject: Subject<MessageEvent>;

    /**
     * Conect to a websocket server
     *  
     * @param {string} url 
     * @returns {Subject<MessageEvent>} 
     * 
     * @memberOf WSocketService
     */
    public connect(): Subject<MessageEvent> {
        if (!this.subject) {
            this.subject = this.create(URL);
        }
        return this.subject;
    }
    /**
     * Create a new connection to a WebSocket server
     * 
     * @private
     * @param {string} url 
     * @returns {Subject<MessageEvent>} 
     * 
     * @memberOf WSocketService
     */
    private create(url: string): Subject<MessageEvent> {
        let ws = new WebSocket(url);

        let observable = Observable.create(
            (obs: Observer<MessageEvent>) => {
                ws.onmessage = obs.next.bind(obs);
                ws.onerror = obs.error.bind(obs);
                ws.onclose = obs.complete.bind(obs);

                return ws.close.bind(ws);
            });

        let observer = {
            next: (data: Object) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(data));
                }
            }
        };

        return Subject.create(observer, observable);
    }
}