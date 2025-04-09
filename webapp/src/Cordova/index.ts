import { setupBluetoothLite} from './bluetooth';
// import {setupGapi} from './gapi';
// import importLocallySavediOSProjects from './importLocallySavediOSProjects';
// import setupiOSrtc from './iosrtc';
// import setupOpenLinks from './openLinks';
// import setupPreventPinchZoom from './preventPinchZoom';
// import lockScreenOrientation from './lockScreenOrientation';
// import setupAccelerometer from './accelerometer';

// function setupCordova() {
//     if (process.env.REACT_APP_IS_CORDOVA === 'true') {
//         lockScreenOrientation();
//         // setupGapi();
//         setupBluetooth();
//         setupiOSrtc();
//         setupOpenLinks();
//         setupPreventPinchZoom();
//         setupAccelerometer();
//         // importLocallySavediOSProjects();
//     }
// }

function setupCordovaLite() {
    setupBluetoothLite();
}

export { setupCordovaLite};
