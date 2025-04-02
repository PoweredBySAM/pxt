import PressureSensorController from "./Controller";
import * as simulator from "../../simulator";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class PressureSensor {
    Controller: PressureSensorController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, PressureSensor>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new PressureSensorController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        PressureSensor.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setPressureSensorColor for ${this.assignedName}`,
            (value: string) => this.Controller.setColor(value)
        );

        this.Controller.on('valueChanged', () => {
            simulator.driver.samMessageToTarget({ 
                type: `${this.assignedName} valueChanged`, 
                value: this.Controller.getValue()
            });
        });
    }

    static hasInstanceWithId(id: string): boolean {
        return PressureSensor.instances.has(id);
    }
}

export default PressureSensor;