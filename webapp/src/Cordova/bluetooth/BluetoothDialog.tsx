import * as React from 'react';
import * as sui from '../../sui';
import { BluetoothDevice } from './Bluetooth';
import { observer } from 'mobx-react';
import Signal from './Signal';

interface BluetoothDialogProps {
    getDiscoveredDevices: () => BluetoothDevice[];
    onDeviceSelected: (device: BluetoothDevice) => void;
}

const BluetoothDialogContent = observer((props: BluetoothDialogProps) => {
    const { getDiscoveredDevices, onDeviceSelected } = props;
    const devices = getDiscoveredDevices();

    const styles = {
        bluetoothDialog: {
            minWidth: '400px',
            padding: '1rem'
        },
        list: {
            margin: 0
        },
        device: {
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: '1px solid rgba(34, 36, 38, 0.1)'
        },
        lastDevice: {
            borderBottom: 'none'
        },
        hexCode: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#9b9b9c',
            fontWeight: 700,
            fontSize: '16px'
        },
        signalStrength: {
            marginTop: '0.5rem',
            color: '#9b9b9c',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        button: {
            margin: 0
        },
        content: {
            flex: 1
        },
        rightContent: {
            marginLeft: '1rem'
        },
        infoMessage: {
            backgroundColor: '#cce5ff',
            borderColor: '#b8daff',
            color: '#004085',
            padding: '1rem',
            borderRadius: '0.25rem',
            marginBottom: '1rem'
        },
        messageHeader: {
            fontWeight: 'bold',
            marginBottom: '0.5rem'
        },
        messageText: {
            margin: 0
        }
    };

    return (
        <div style={styles.bluetoothDialog}>
            {devices.length > 0 ? (
                <div className="ui divided relaxed list" style={styles.list}>
                    {devices.map((device, index) => (
                        <div 
                            key={device.id} 
                            className="bluetooth-device ui item"
                            style={{
                                ...styles.device,
                                ...(index === devices.length - 1 ? styles.lastDevice : {})
                            }}
                        >
                            <div style={styles.content}>
                                <div style={styles.hexCode}>
                                    <sui.Icon icon="bluetooth" />
                                    {device.deviceHex}
                                </div>
                                <div style={styles.signalStrength}>
                                    <Signal signal={device.rssi} />
                                    {device.rssi} dBm
                                </div>
                            </div>
                            <div style={styles.rightContent}>
                                <sui.Button
                                    className="primary"
                                    text={lf("Select")}
                                    onClick={() => onDeviceSelected(device)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.infoMessage}>
                    <div style={styles.messageHeader}>No devices found</div>
                    <p style={styles.messageText}>Make sure your Bluetooth device is turned on and in range.</p>
                </div>
            )}
        </div>
    );
});

export function getBluetoothDialog(props: BluetoothDialogProps): React.ReactElement {
    return <BluetoothDialogContent {...props} />;
} 