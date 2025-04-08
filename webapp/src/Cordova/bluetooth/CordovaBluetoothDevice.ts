import {EventEmitter} from 'events';
import {computed, observable} from 'mobx';
import {BLE, DeviceDiscoveredInfo} from './ble';
import {Service} from './Service';

class CordovaBluetoothDevice extends EventEmitter implements BluetoothDevice {
    id: string;
    name: string;
    gatt: BluetoothRemoteGATTServer;
    watchingAdvertisements = false;
    onadvertisementreceived = () => {};
    ongattserverdisconnected = () => {};
    oncharacteristicvaluechanged = () => {};
    onserviceadded = () => {};
    onservicechanged = () => {};
    onserviceremoved = () => {};

    private services: Service[] = [];
    private ble = BLE.getInstance();

    rssi = 0;
    deviceHex: string;
    connected = false;
    @computed
    get receivingAdvertisements() {
        return this._receivingAdvertisements;
    }

    @observable
    private _receivingAdvertisements = false;

    private inRangeTimeout?: number;

    constructor(deviceInfo: DeviceDiscoveredInfo) {
        super();
        this.id = deviceInfo.id;
        this.name = deviceInfo.name;
        // @ts-ignore
        this.gatt = {
            device: this,
            connected: false,
            connect: async () => {
                const peripheralObject = await this.ble.connect(this.id);
                // @ts-ignore
                this.gatt.connected = true;

                if (this.services.length === 0) {
                    this.services = peripheralObject.services.map(
                        (serviceId) => new Service(this, serviceId, peripheralObject)
                    );
                }

                return this.gatt;
            },
            disconnect: async () => {
                await this.ble.disconnect(this.id);
            },
            getPrimaryService: async (serviceId: string | number) => {
                const service = this.services.find(
                    (service) => service.uuid === serviceId
                );

                if (service) {
                    return service;
                }

                throw new Error('Service not found');
            },
            getPrimaryServices: async () => {
                return this.services;
            },
        };
        this.deviceHex = deviceInfo.deviceHex;

        this.ble.on(`${this.id}-disconnected`, () => {
            console.log('i am disconnected....');
            // @ts-ignore
            this.gatt.connected = false;
            this.ongattserverdisconnected && this.ongattserverdisconnected();
            this.emit('gattserverdisconnected');
        });

        this.on('advertisementreceived', () => {
            console.log('ADDDDDDD received');
            this._receivingAdvertisements = true;
            window.clearTimeout(this.inRangeTimeout);
            this.inRangeTimeout = window.setTimeout(() => {
                this._receivingAdvertisements = false;
            }, 3000);
        });
    }

    watchAdvertisements = async () => {
        // Always watching....
    };

    unwatchAdvertisements = async () => {
        throw new Error('unwatchAdvertisements not implemented');
    };

    dispatchEvent = (event: Event) => {
        throw new Error('dispatchEvent not implemented');
    };

    addEventListener = (
        type: string,
        listener: EventListenerOrEventListenerObject,
        useCapture?: boolean
    ) => {
        // TODO I don't know what EventListenerObject is.
        this.on(type, listener as EventListener);
    };

    removeEventListener = (
        type: string,
        listener: EventListenerOrEventListenerObject
    ) => {
        this.off(type, listener as EventListener);
    };
}

export {CordovaBluetoothDevice};
