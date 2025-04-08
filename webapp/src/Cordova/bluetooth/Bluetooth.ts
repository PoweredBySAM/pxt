import {autorun} from 'mobx';
import {BLE} from './ble';
import * as core from '../../core';
import { getBluetoothDialog } from './BluetoothDialog';

export interface BluetoothDevice {
    id: string;
    name?: string;
    rssi: number;
    deviceHex: string;
    receivingAdvertisements: boolean;
}

export class Bluetooth {
    private ble = BLE.getInstance();

    constructor() {
        window.startBluetoothScan = () => {
            this.ble.startScan({
                filters: [
                    {
                        namePrefix: 'SAM',
                    },
                ],
            });
        };

        window.getUserInputHexValue = (userHexValue?: string) => {
            this.ble.setUserInputHexValue(userHexValue);
        };

        window.stopBluetoothScan = () => {
            this.ble.stopScan();
        };
    }

    getAvailability = async () => {
        return await this.ble.isEnabled();
    };

    requestDevice = async (options: RequestDeviceOptions): Promise<BluetoothDevice> => {
        return new Promise((resolve, reject) => {
            this.ble.startScan(options);

            core.dialogAsync({
                header: 'Bluetooth',
                size: 'large',
                hasCloseIcon: true,
                jsxd: () => getBluetoothDialog({
                    getDiscoveredDevices: () => this.ble.discoveredDevices,
                    onDeviceSelected: (device: BluetoothDevice) => {
                        core.hideDialog();
                        resolve(device);
                    },
                })
            }).then(() => {
                const error = new Error(
                    'DOMException: User cancelled the requestDevice() chooser.'
                );
                // @ts-ignore
                error.code = 8;
                reject(error);
            });
        });
    };

    getDevices = () => {
        let alreadySentDeviceIds: Set<string> = new Set();

        return {
            then: (receiveDevices: (bluetoothDevices: BluetoothDevice[]) => void) => {
                autorun(() => {
                    const newDevices = this.ble.discoveredDevices.filter(
                        (device) => !alreadySentDeviceIds.has(device.id)
                    );

                    newDevices.forEach((device) => {
                        alreadySentDeviceIds.add(device.id);
                        alreadySentDeviceIds.add(device.deviceHex);
                    });

                    receiveDevices(newDevices);
                });
            },
        };
    };
}
