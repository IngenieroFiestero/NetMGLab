/**
 * A Device is a managed system like a switch, router, server...
 * 
 * @export
 * @class Device
 */
export class Device {
    constructor(obj : any){
        this._id = obj._id;
        this.name = obj.name;
        this.description = obj.description;
        this.ip = obj.ip;
        this.port = obj.port;
        this.readOnlyCommunity = obj.readOnlyCommunity;
        this.readWriteCommunity = obj.readWriteCommunity;
    }
    _id: String;
    name: string;//The name of the device
    description: string;//Description about devie
    ip: String;//The ip of the device
    port: number;
    readOnlyCommunity: string;
    readWriteCommunity: String;
}