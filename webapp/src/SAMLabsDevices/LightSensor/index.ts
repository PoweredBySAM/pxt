import LightSensorController from "./Controller";
import * as simulator from "../../simulator";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class LightSensor {
    Controller: LightSensorController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, LightSensor>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new LightSensorController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        LightSensor.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setLightSensorColor for ${this.assignedName}`,
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
        return LightSensor.instances.has(id);
    }
}

export default LightSensor;