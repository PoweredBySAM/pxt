import {EventEmitter} from 'events';
import {BLE} from './ble';

class Characteristic extends EventEmitter implements BluetoothRemoteGATTCharacteristic {
    private ble = BLE.getInstance();
    uuid: string;
    serviceUuid: string;
    properties: BluetoothCharacteristicProperties;
    device: BluetoothDevice;
    oncharacteristicvaluechanged = (event: {
        target: {value: {buffer: ArrayBuffer}} | any;
    }) => {};
    constructor(device: BluetoothDevice, serviceUuid: string, uuid: string) {
        super();
        this.device = device;
        this.uuid = uuid.toLowerCase();
        this.serviceUuid = serviceUuid;
        this.properties = {
            read: false,
            write: false,
            reliableWrite: false,
            broadcast: false,
            writableAuxiliaries: false,
            writeWithoutResponse: false,
            notify: false,
            indicate: false,
            authenticatedSignedWrites: false,
        };

        this.ble.on(
            `${device.id}-characteristicNotification`,
            (characteristicId: string, data: ArrayBuffer) => {
                if (characteristicId === this.uuid) {
                    const event = {
                        target: {
                            value: {
                                buffer: data,
                            },
                        },
                    };
                    this.oncharacteristicvaluechanged(event);

                    this.emit('characteristicvaluechanged', event);
                }
            }
        );
    }

    getDescriptor = async () => {
        throw new Error('getDescriptor not implemented');
    };

    getDescriptors = async () => {
        throw new Error('getDescriptors not implemented');
    };

    dispatchEvent = (event: Event) => {
        throw new Error('dispatchEvent not implemented');
    };

    readValue = async () => {
        console.log('read value');
        const value = new DataView(
            await this.ble.read(this.device.id, this.serviceUuid, this.uuid)
        );
        console.log('value read');
        return value;
    };

    writeValue = async (data: Uint8Array) => {
        console.log('writing value');
        await this.ble.write(this.device.id, this.serviceUuid, this.uuid, data);
        console.log('value written');
    };

    writeValueWithResponse = async () => {
        throw new Error('writeValueWithResponse not implemented');
    };

    writeValueWithoutResponse = async (data: Uint8Array) => {
        throw new Error('writeValueWithoutResponse not implemented');
    };

    startNotifications = async () => {
        console.log('starting notifications');
        await this.ble.startNotifications(this.device.id, this.serviceUuid, this.uuid);
        console.log('notifications started');
        return this;
    };

    stopNotifications = async () => {
        console.log('stopping notificatoins');
        await this.ble.stopNotifications(this.device.id, this.serviceUuid, this.uuid);
        console.log('notificaitions stopped');
        return this;
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

export {Characteristic};
