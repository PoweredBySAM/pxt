import * as simulator from "../../simulator";
import LEDController from "./Controller";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class LED {
    Controller: LEDController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, LED>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new LEDController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        LED.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setLEDColor for ${this.assignedName}`,
            (value: string) => this.Controller.setLEDColor(value)
        );
        this.bluetoothHandler.registerMessageHandler(
            `setLEDDeviceBodyColor for ${this.assignedName}`,
            (value: string) => this.Controller.setColor(value)
        );
        this.bluetoothHandler.registerMessageHandler(
            `setLEDBrightness for ${this.assignedName}`,
            (value: number) => this.Controller.setLEDBrightness(value)
        );
        this.bluetoothHandler.registerMessageHandler(
            `turnLEDOff for ${this.assignedName}`,
            () => this.Controller.turnLEDOff()
        );

        this.Controller.on('valueChanged', () => {
            simulator.driver.samMessageToTarget({ 
                type: `${this.assignedName} valueChanged`, 
                value: this.Controller.getLEDColor()
            });
        });
    }

    static hasInstanceWithId(id: string): boolean {
        return LED.instances.has(id);
    }
}

export default LED;