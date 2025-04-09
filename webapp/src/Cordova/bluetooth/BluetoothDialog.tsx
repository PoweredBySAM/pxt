import * as React from 'react';
import { BluetoothDevice } from './Bluetooth';
import Signal from './Signal';
import * as simulator from "../../simulator";
import * as core from "../../core";
import IconPairing from './IconPairing';

interface BluetoothDialogProps {
    getDiscoveredDevices: () => BluetoothDevice[];
    onDeviceSelected: (device: BluetoothDevice | null) => void;
}

const BluetoothDialogContent: React.FC<BluetoothDialogProps> = (props) => {
    const { getDiscoveredDevices, onDeviceSelected } = props;
    const [devices, setDevices] = React.useState<BluetoothDevice[]>([]);

    React.useEffect(() => {
        const updateDevices = () => {
            const currentDevices = getDiscoveredDevices().filter(
                (device) => device.receivingAdvertisements
            );
            setDevices(currentDevices);
        };
        updateDevices();

        // Set up interval for updates
        const intervalId = setInterval(updateDevices, 100);

        return () => clearInterval(intervalId);
    }, [getDiscoveredDevices]);

    const styles = {
        bluetoothDialog: {
            width: '100%',
            backgroundColor: '#ffffff'
        },
        header: {
            padding: '16px 20px',
            borderBottom: '1px solid #e0e0e0',
            fontSize: '24px',
            fontWeight: 600 as const,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: '#666666',
            fontSize: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        deviceList: {
            padding: '8px 0'
        },
        device: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid #f5f5f5'
        },
        deviceName: {
            color: '#000000',
            fontSize: '14px'
        },
        deviceId: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#666666',
            fontSize: '16px'
        },
        rightContent: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        connectButton: {
            backgroundColor: '#4fd1c5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
        },
        noDevices: {
            padding: '20px',
            textAlign: 'center' as const,
            color: '#666666'
        }
    };

    return (
        <div style={styles.bluetoothDialog}>
            <div style={styles.header}>
                <span>Bluetooth</span>
                <button
                    style={styles.closeButton}
                    onClick={() => {
                        core.hideDialog();
                        simulator.driver.samMessageToTarget({
                            type: `cordovaModalClosed`
                        });
                    }}
                    aria-label="Close dialog"
                >
                    ✕
                </button>
            </div>
            {devices.length > 0 ? (
                <div style={styles.deviceList}>
                    {devices.map((device) => (
                        <div key={device.id} style={styles.device}>
                            <div style={styles.deviceName}>{device.name}</div>
                            {device.name !== 'BBC micro:bit [zetug]' && <div style={styles.deviceId}>
                                <IconPairing />
                                {device.deviceHex}
                            </div>}
                            <Signal signal={device.rssi} />
                            <button
                                style={styles.connectButton}
                                onClick={() => onDeviceSelected(device)}
                            >
                                Connect
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.noDevices}>
                    No Bluetooth devices found
                </div>
            )}
        </div>
    );
};

export function getBluetoothDialog(props: BluetoothDialogProps): React.ReactElement {
    return <BluetoothDialogContent {...props} />;
}