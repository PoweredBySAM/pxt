import {EventEmitter} from 'events';
// Exporting ble from the window. This is put there by the cordova-plugin-ble-central plugin.
// In this file, we will make it type-safe and convert to use mobx and promises instead of callbacks.

// TODO I am not considering the possibility that the client will try to do multiple scans in parallel.
// If that is attempted, it might be possible for two scans to connect to the same device.

import {reaction, computed, observable} from 'mobx';
import {CordovaBluetoothDevice} from './CordovaBluetoothDevice';
import {lastTwoBytesToHex} from './utilities';

export interface DeviceDiscoveredInfo {
    name: string;
    id: string;
    rssi: number;
    deviceHex: string;
}

export interface PeripheralObject {
    name: string;
    id: string;
    services: string[];
    characteristics: {
        service: string;
        characteristic: string;
        properties: string[];
    }[];
}

class BLE extends EventEmitter {
    // TODO switch back to my normal javascript style.
    // I think the solution was to use require in the index.ts file.
    private static instance: BLE;
    static getInstance = () => {
        BLE.instance = BLE.instance || new BLE();
        return BLE.instance;
    };

    // @ts-ignore
    private readonly ble: any = window.ble;
    private connectedDeviceIds: string[] = [];

    @observable
    userInputHexValue?: string = undefined;

    @computed
    get discoveredDevices(): CordovaBluetoothDevice[] {
        return this._discoveredDevices.filter((device) => {
            if (!this.scanningOptions) return false;
            // Do not show connected devices as discovered.
            if (this.connectedDeviceIds.includes(device.id)) {
                return false;
            }

            if ('acceptAllDevices' in this.scanningOptions) {
                return true;
            }

            if (this.userInputHexValue) {
                return device.deviceHex.startsWith(this.userInputHexValue);
            }

            const hasMatchingFilter = this.scanningOptions.filters?.some(
                (filter) =>
                    filter.namePrefix && device.name?.startsWith(filter.namePrefix)
            );

            return Boolean(hasMatchingFilter);
        });
    }

    @observable
    private _discoveredDevices: CordovaBluetoothDevice[] = [];

    @observable
    scanningOptions?: RequestDeviceOptions = undefined;

    constructor() {
        super();
        if (BLE.instance) {
            throw new Error('BLE must be a singleton.');
        }

        // Start and stop scans.
        reaction(
            () => this.scanningOptions,
            () => {
                if (this.scanningOptions) {
                    // TODO what if already scanning?
                    this.ble.startScanWithOptions(
                        [],
                        {reportDuplicates: true},
                        (device: any) => {
                            if (!this.scanningOptions) {
                                console.warn('Still scanning with no options');
                                return;
                            }

                            const alreadyDiscoveredDevice = this._discoveredDevices.find(
                                (d) => {
                                    const isSameDevice = d.id === device.id;
                                    return this.userInputHexValue
                                        ? isSameDevice &&
                                              d.deviceHex.startsWith(
                                                  this.userInputHexValue
                                              )
                                        : isSameDevice;
                                }
                            );

                            if (alreadyDiscoveredDevice) {
                                if (!alreadyDiscoveredDevice.gatt.connected) {
                                    alreadyDiscoveredDevice.rssi = device.rssi;
                                    console.log('emit', device.id);
                                    alreadyDiscoveredDevice.emit(
                                        'advertisementreceived',
                                        {
                                            rssi: device.rssi,
                                        }
                                    );
                                }
                            } else if ('acceptAllDevices' in this.scanningOptions) {
                                this._discoveredDevices.push(
                                    new CordovaBluetoothDevice({
                                        id: device.id,
                                        name: device.name,
                                        rssi: device.rssi,
                                        deviceHex: lastTwoBytesToHex(
                                            device.advertising.kCBAdvDataManufacturerData
                                        ),
                                    })
                                );
                            } else if (
                                this.scanningOptions.filters &&
                                this.scanningOptions.filters.find((filter) => {
                                    if (
                                        filter.namePrefix &&
                                        device.name?.startsWith(filter.namePrefix)
                                    ) {
                                        return true;
                                    }

                                    return false;
                                })
                            ) {
                                this._discoveredDevices.push(
                                    new CordovaBluetoothDevice({
                                        id: device.id,
                                        name: device.name,
                                        rssi: device.rssi,
                                        deviceHex: lastTwoBytesToHex(
                                            device.advertising.kCBAdvDataManufacturerData
                                        ),
                                    })
                                );
                            }
                        },
                        () => {
                            console.error(
                                'Failed to start scanning for bluetooth devices.'
                            );
                            this.scanningOptions = undefined;
                        }
                    );
                } else {
                    this.ble.stopScan(
                        () => {
                            // TODO we never want to lose our reference to any discovered devices, but at the same time,
                            // we need to be able to allow the filters to be used?
                            // if (!this.scanningOptions) {
                            //     this._discoveredDevices = [];
                            // }
                        },
                        () => {
                            console.error(
                                'Failed to stop scanning for bluetooth devices.'
                            );
                        }
                    );
                }
            }
        );
    }
    setUserInputHexValue = (userHexValue?: string) => {
        this.userInputHexValue = userHexValue;
    };

    isEnabled: () => Promise<boolean> = () =>
        new Promise((resolve, reject) => {
            this.ble.isEnabled(resolve, reject);
        });

    startScan = (options: RequestDeviceOptions) => {
        this.scanningOptions = options;
    };

    stopScan = () => {
        this.scanningOptions = undefined;
    };

    connect = async (deviceId: string): Promise<PeripheralObject> =>
        new Promise((resolve, reject) => {
            this.ble.connect(
                deviceId.toUpperCase(),
                (peripheralObject: PeripheralObject) => {
                    console.log('peripheral object', peripheralObject);
                    this.connectedDeviceIds.push(deviceId);
                    resolve(peripheralObject);
                },
                () => {
                    // This callback gets called if device connection fails, or if the device
                    // disconnects itself in the future. Calling reject multiple times is not a problem.
                    this.connectedDeviceIds = this.connectedDeviceIds.filter(
                        (id) => id !== deviceId
                    );
                    this.emit(`${deviceId}-disconnected`, deviceId);
                    // this.removeAllListeners(`${deviceId}-characteristicNotification`);
                    // this.removeAllListeners(`${deviceId}-disconnected`);

                    reject();
                }
            );
        });

    disconnect = async (deviceId: string): Promise<void> =>
        new Promise((resolve, reject) => {
            this.ble.disconnect(
                deviceId.toUpperCase(),
                () => {
                    // TODO duplicated code
                    this.connectedDeviceIds = this.connectedDeviceIds.filter(
                        (id) => id !== deviceId
                    );
                    this.emit(`${deviceId}-disconnected`, deviceId);
                    // this.removeAllListeners(`${deviceId}-characteristicNotification`);
                    // this.removeAllListeners(`${deviceId}-disconnected`);
                    resolve();
                },
                reject
            );
        });

    read = (
        deviceId: string,
        serviceId: string,
        characteristicId: string
    ): Promise<ArrayBuffer> =>
        new Promise((resolve, reject) => {
            this.ble.read(
                deviceId.toUpperCase(),
                serviceId.toUpperCase(),
                characteristicId.toUpperCase(),
                (data: ArrayBuffer) => {
                    resolve(data);
                },
                reject
            );
        });

    write = (
        deviceId: string,
        serviceId: string,
        characteristicId: string,
        data: Uint8Array
    ): Promise<void> =>
        new Promise((resolve, reject) => {
            console.log('writing', deviceId, serviceId, characteristicId, data);
            this.ble.write(
                deviceId.toUpperCase(),
                serviceId.toUpperCase(),
                characteristicId.toUpperCase(),
                data.buffer,
                () => resolve(),
                reject
            );
        });

    startNotifications = (
        deviceId: string,
        serviceId: string,
        characteristicId: string
    ): Promise<void> =>
        new Promise((resolve, reject) => {
            console.log('starting notifications', deviceId, serviceId, characteristicId);
            setTimeout(resolve, 200);
            this.ble.startNotification(
                deviceId.toUpperCase(),
                serviceId.toUpperCase(),
                characteristicId.toUpperCase(),
                (buffer: ArrayBuffer) => {
                    console.log('notification');
                    console.log(characteristicId);
                    this.emit(
                        `${deviceId}-characteristicNotification`,
                        characteristicId,
                        buffer
                    );
                    resolve();
                },
                reject
            );
        });

    stopNotifications = (
        deviceId: string,
        serviceId: string,
        characteristicId: string
    ): Promise<void> =>
        new Promise((resolve, reject) => {
            this.ble.stopNotification(
                deviceId.toUpperCase(),
                serviceId.toUpperCase(),
                characteristicId.toUpperCase(),
                () => {
                    resolve();
                },
                reject
            );
        });
}

export {BLE};
