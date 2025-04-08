import {EventEmitter} from 'events';
import {PeripheralObject} from './ble';
import {Characteristic} from './Characteristic';

class Service extends EventEmitter implements BluetoothRemoteGATTService {
    uuid: string;
    device: BluetoothDevice;
    isPrimary = true;
    oncharacteristicvaluechanged = () => {};
    onserviceadded = () => {};
    onservicechanged = () => {};
    onserviceremoved = () => {};

    private characteristics: Characteristic[] = [];

    constructor(
        device: BluetoothDevice,
        uuid: string,
        peripheralObject: PeripheralObject
    ) {
        super();
        this.uuid = uuid.toLowerCase();
        this.device = device;

        const ownCharacteristics = peripheralObject.characteristics.filter(
            (characteristic) => characteristic.service.toLowerCase() === this.uuid
        );
        this.characteristics = ownCharacteristics.map(
            (characteristic) =>
                new Characteristic(device, this.uuid, characteristic.characteristic)
        );
    }

    getIncludedService = async () => {
        throw new Error('getIncludedService not implemented');
    };

    getIncludedServices = async () => {
        throw new Error('getIncludedServices not implemented');
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

    getCharacteristic: (
        characteristicId: BluetoothCharacteristicUUID
    ) => Promise<BluetoothRemoteGATTCharacteristic> = async (characteristicId) => {
        const characteristic = this.characteristics.find(
            (characteristic) => characteristic.uuid === characteristicId
        );

        if (characteristic) {
            return characteristic;
        }

        throw new Error('Characteristic not found');
    };

    getCharacteristics: () => Promise<BluetoothRemoteGATTCharacteristic[]> = async () => {
        return this.characteristics;
    };
}

export {Service};
