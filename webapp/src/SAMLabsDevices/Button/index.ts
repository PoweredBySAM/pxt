import ButtonController from "./Controller";
import * as simulator from "../../simulator";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class Button {
    Controller: ButtonController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, Button>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new ButtonController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        Button.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setButtonColor for ${this.assignedName}`,
            (value: string) => this.Controller.setColor(value)
        );

        this.Controller.on('pressed', () => {
            simulator.driver.samMessageToTarget({ type: `${this.assignedName} buttonPressed` });
        });
        this.Controller.on('released', () => {
            simulator.driver.samMessageToTarget({ type: `${this.assignedName} buttonReleased` });
        });
    }

    static hasInstanceWithId(id: string): boolean {
        return Button.instances.has(id);
    }
}

export default Button;