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



    requestDevice = async (options: RequestDeviceOptions): Promise<BluetoothDevice> => {
        return new Promise((resolve, reject) => {
            this.ble.startScan(options);

            core.dialogAsync({
                header: '',
                size: 'small',
                hasCloseIcon: false,
                hideCancel: true,
                onClose: () => {
                    this.ble.stopScan();
                },
                jsxd: () => getBluetoothDialog({
                    getDiscoveredDevices: () => this.ble.discoveredDevices,
                    onDeviceSelected: (device: BluetoothDevice) => {
                        if (device) {
                            core.hideDialog();
                            resolve(device);
                        }
                    },
                })
            });
        });
    };

}
