// @ts-nocheck
import { parameterValidator } from './Utils'
import EventEmitter from 'event-emitter';


const standardServiceUUID = '3b989460-975f-11e4-a9fb-0002a5d5c51b'
const batteryServiceUUID = '0000180f-0000-1000-8000-00805f9b34fb'
const readCharacteristicUUID = '4c592e60-980c-11e4-959a-0002a5d5c51b'
const writeCharacteristicUUID = '84fc1520-980c-11e4-8bed-0002a5d5c51b'
const colorCharacteristicUUID = '5baab0a0-980c-11e4-b5e9-0002a5d5c51b'
const hexServiceUUID = '587ecb20-ddd3-11e4-9473-0002a5d5c51b'

class BaseController extends EventEmitter {
    on(event: string, listener: (...args: any[]) => void) {
        super.on(event, listener);
    }
    _getDefaultDeviceColor;
    _isConnected;
    _deviceHexId;

    constructor(defaultDeviceColor, namePrefix) {
        super()
        this._getDefaultDeviceColor = () => defaultDeviceColor
        this._namePrefix = namePrefix
        this._device
        this._colorCharacteristic
        this._readCharacteristic
        this._writeCharacteristic
        this._writing = false
        this._isConnected = false
        this._connecting = false
        this._color
        this._writeCharacteristicValue
        this._deviceHexId = ''
        this.cordovaHex = ''

        var originalEmit = this.emit
        var self = this
        this.emit = function() {
            if(this._connecting && arguments[0] !== 'connecting') return
            originalEmit.apply(self, arguments)
        }
    }

    setColor = parameterValidator(['string'], (hexColor) => {
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            } : null
        }

        var rgb = hexToRgb(hexColor)
        if(!rgb) throw new Error(`"${hexColor}" is not a valid color.`)
        this._color = rgb
        this._writeColor = true
        this._write()
    })

    hexStringToUint8Array = (hexString) => {
        if(hexString.length % 2 !== 0) {
            throw new Error('Invalid hexString')
        }
        const arrayBuffer = new Uint8Array(hexString.length / 2)
        for(let i = 0; i < hexString.length; i += 2) {
            const byteValue = parseInt(hexString.substr(i, 2), 16)
            if(isNaN(byteValue)) {
                this.emit('bluetoothCancelled')
                this.emit('hexValueError', hexString.substr(i, 2))
                throw new Error(`Invalid hex value detected: "${hexString.substr(i, 2)}". Please ensure you only use valid hex characters (0-9, A-F).`)
            }
            arrayBuffer[i / 2] = byteValue
        }

        return arrayBuffer
    }

    setConnectedToSimDevice = (state) => {
        this._connectedToSimDevice= !!state
    }

    reset = () => {
        // Previously, when the program stopped I returned it back
        // to the original color.  If we want that behavior back then uncomment this.
        //this.setColor(this._getDefaultDeviceColor())
        this._reset && this._reset()
    }

    _setWriteCharacteristicValue = (value) => {
        this._writeCharacteristicValue = value
        this._writeValue = true
        this._write()
    }

    _write = () => {
        if(this._writing || !(this._device && this._device.gatt.connected) || !this._isConnected) return
        this._writing = true
        if(this._writeValue && this._writeCharacteristicValue) {
            this._writeValue = false
            this._writeCharacteristic.writeValue(new Uint8Array(this._writeCharacteristicValue)).then(() => {
                this._writing = false
                if(this._writeValue || this._writeColor) this._write()
            }).catch((err) => {
                console.warn(err)
                this._writing = false
            })
        }
        else if(this._writeColor) {
            this._writeColor = false
            this._colorCharacteristic.writeValue(new Uint8Array([this._color.r, this._color.g, this._color.b])).then(() => {
                this._writing = false
                this._writeValue = true
                this._write()
            }).catch((err) => {
                console.warn(err)
                this._writing = false
            })
        }
        else {
            this._writing = false
        }
    }
    getAbortController = () => {
        const controller = new AbortController();
        const signal = controller.signal;
        return { controller, signal };
    }

    connect = (callback,hexValue) => {
        if(this._isConnected || this._connecting) return callback('already connected')

        const {signal}=this.getAbortController()||null;
        let batteryLevel
        let filters=[]

        if(hexValue !== undefined) {
            const manufacturerData = [
                {
                    companyIdentifier: 0xcc01,
                    dataPrefix: this.hexStringToUint8Array(
                        `ffff${hexValue}${'f'.repeat(4 - hexValue.length)}`
                    ),
                    mask: this.hexStringToUint8Array(
                        `0000${'f'.repeat(hexValue.length)}${'0'.repeat(
                            4 - hexValue.length
                        )}`
                    ),
                },
            ]
            filters.push({
                manufacturerData,
            })
        }
        else {
            filters.push({
                namePrefix: this._namePrefix,
            })
        }

        navigator.bluetooth.requestDevice({
            filters: filters,
            optionalServices: [standardServiceUUID, 0x180f],
        })
        .then((device) => {
            console.log('Device selected:', device.name);
            this._device = device;
            this.cordovaHex = this._device.deviceHex;
            return this._connectDevice(device, callback, batteryLevel);
        })
        .catch((err) => {
            console.log('Bluetooth error:', err);
            if (err.name === 'NotFoundError') {
                this.emit('bluetoothCancelled');
                callback(err);
                return;
            }
            this.disconnect();
            callback(err);
        });
    }

    _connectDevice = (device, callback, batteryLevel) => {
        if(device.name !== this._namePrefix) throw new Error('Incorrect Device');
        if(device.gatt.connected) {
            this._device = null;
            throw new Error('Device already connected');
        }

        this._connecting = true;
        this.emit('connecting');

        return device.gatt.connect()
            .then(() => device.gatt.getPrimaryServices())
            .then((services) => {
                var batteryService = services.find((service) => service.uuid === batteryServiceUUID || service.uuid === '180f');
                var standardService = services.find((service) => service.uuid === standardServiceUUID);

                standardService.getCharacteristics().then((characteristics) => {
                    const hexCharacteristic = characteristics.find((characteristic) => characteristic.uuid === hexServiceUUID);
                    if(hexCharacteristic.properties.read) {
                        hexCharacteristic.readValue().then((value) => {
                            const bytes = new Uint8Array(value.buffer);
                            const fullHex = Array.from(bytes)
                                .map((b) => b.toString(16).padStart(2, '0'))
                                .join('');
                            this._deviceHexId = fullHex.slice(-4);
                        });
                    }
                });

                return batteryService.getCharacteristics().then((batteryCharacteristics) => {
                    this._batteryCharacteristic = batteryCharacteristics[0];
                    this._batteryCharacteristic.oncharacteristicvaluechanged = (event) => {
                        this.emit('batteryLevelChange', new Uint8Array(event.target.value.buffer)[0]);
                    };

                    return this._batteryCharacteristic.readValue()
                        .then((event) => {
                            batteryLevel = new Uint8Array(event.buffer)[0];
                        })
                        .then(() => this._batteryCharacteristic.stopNotifications())
                        .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
                        .then(() => this._batteryCharacteristic.startNotifications())
                        .then(() => standardService.getCharacteristics());
                });
            })
            .then((characteristics) => {
                var promise;

                characteristics.forEach((characteristic) => {
                    if(characteristic.uuid === readCharacteristicUUID) {
                        this._readCharacteristic = characteristic;

                        promise = characteristic.readValue()
                            .then((event) => {
                                if(!this._onReadCharacteristicValueChanged) return;
                                this._onReadCharacteristicValueChanged(new Uint8Array(event.buffer));
                            })
                            .catch((err) => {
                                // Old SAM Labs pieces don't support the readValue command.
                                // That means they won't get the initial value, they'll just be
                                // stuck with the default value until an event occurs.
                            })
                            .then(() => characteristic.stopNotifications())
                            .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
                            .then(() => characteristic.startNotifications())
                            .then(() => {
                                characteristic.oncharacteristicvaluechanged = (event) => {
                                    if(!this._onReadCharacteristicValueChanged) return;
                                    setTimeout(() => this._onReadCharacteristicValueChanged(new Uint8Array(event.target.value.buffer)));
                                };
                            })
                            .catch((err) => {
                                console.warn(err);
                                this.disconnect();
                            });
                    }

                    if(characteristic.uuid === writeCharacteristicUUID) {
                        this._writeCharacteristic = characteristic;
                    }

                    if(characteristic.uuid === colorCharacteristicUUID) {
                        this._colorCharacteristic = characteristic;
                    }
                });

                return promise;
            })
            .then(() => {
                this._isConnected = true;
                this._connecting = false;
                this._device.addEventListener('gattserverdisconnected', () => {
                    this.disconnect();
                });
                this.emit('connected');
                this.emit('batteryLevelChange', batteryLevel);
                this.setColor(this._getDefaultDeviceColor());
                this.reset && this.reset();
                callback();
            })
            .catch((err) => {
                console.log(err);
                if(err.code === 8) {
                    callback();
                } else {
                    this.disconnect();
                    callback(err);
                }
            });
    }

    disconnect = function() {
        if(this._device) {
            if(this._readCharacteristic) this._readCharacteristic.oncharacteristicvaluechanged = null
            if(this._batteryCharacteristic) this._batteryCharacteristic.oncharacteristicvaluechanged = null
            this._device.gatt.disconnect()
            this._device = null
        }
        this._isConnected = false
        this._connecting = false
        this.emit('disconnected')
    }
}

export default BaseController