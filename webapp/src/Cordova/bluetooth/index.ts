

function setupBluetoothLite() {
    const Bluetooth = require('./Bluetooth').Bluetooth;
    // Define web bluetooth. If web bluetooth is already defined, this will do nothing.
    // @ts-ignore
    if (!window.navigator.bluetooth) {
        // @ts-ignore
        window.navigator.bluetooth = new Bluetooth();
    }
}

export { setupBluetoothLite};
