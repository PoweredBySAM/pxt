import ProximitySensorController from "./Controller";
import * as simulator from "../../simulator";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class ProximitySensor {
    Controller: ProximitySensorController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, ProximitySensor>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new ProximitySensorController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        ProximitySensor.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setProximitySensorColor for ${this.assignedName}`,
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
        return ProximitySensor.instances.has(id);
    }
}

export default ProximitySensor;