import TemperatureSensorController from "./controller";
import * as simulator from "../../simulator";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class TemperatureSensor {
    Controller: TemperatureSensorController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, TemperatureSensor>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new TemperatureSensorController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        TemperatureSensor.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setTemperatureSensorColor for ${this.assignedName}`,
            (value: string) => this.Controller.setColor(value)
        );

        this.Controller.on('valueChanged', () => {
            simulator.driver.samMessageToTarget({ 
                type: `${this.assignedName} valueChanged`, 
                value: this.Controller.getCelsiusValue()
            });
        });
    }

    static hasInstanceWithId(id: string): boolean {
        return TemperatureSensor.instances.has(id);
    }
}

export default TemperatureSensor;