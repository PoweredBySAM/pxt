import ServoMotorController from "./Controller";
import * as simulator from "../../simulator";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class ServoMotor {
    Controller: ServoMotorController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, ServoMotor>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new ServoMotorController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        ServoMotor.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setPosition for ${this.assignedName}`,
            (value: number) => this.Controller.setPosition(value)
        );
        this.bluetoothHandler.registerMessageHandler(
            `setServoMotorColor for ${this.assignedName}`,
            (value: string) => this.Controller.setColor(value)
        );
        this.bluetoothHandler.registerMessageHandler(
            `stopServoMotor for ${this.assignedName}`,
            () => this.Controller.setPosition(0)
        );

        this.Controller.on('valueChanged', () => {
            simulator.driver.samMessageToTarget({ 
                type: `${this.assignedName} valueChanged`, 
                value: this.Controller.getPosition()
            });
        });
    }

    static hasInstanceWithId(id: string): boolean {
        return ServoMotor.instances.has(id);
    }
}

export default ServoMotor;