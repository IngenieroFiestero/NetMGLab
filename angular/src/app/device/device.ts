/**
 * A Device is a managed system like a switch, router, server...
 * 
 * @export
 * @class Device
 */
export class Device {
    id: String;
    name: string;//The name of the device
    description: string;//Description about devie
    ip: String;//The ip of the device
    snmp: SNMPDevice;//SNMP info
}
export class SNMPDevice {
    port: number;
    readOnlyCommunity: string;
    readWriteCommunity: String;
}