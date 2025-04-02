import TiltController from "./Controller";
import * as simulator from "../../simulator";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class Tilt {
    Controller: TiltController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, Tilt>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new TiltController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        Tilt.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setTiltColor for ${this.assignedName}`,
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
        return Tilt.instances.has(id);
    }
}

export default Tilt;