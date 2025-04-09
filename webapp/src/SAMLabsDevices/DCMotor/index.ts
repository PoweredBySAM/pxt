import DCMotorController from "./Controller";
import * as simulator from "../../simulator";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class DCMotor {
    Controller: DCMotorController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, DCMotor>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new DCMotorController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        DCMotor.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setDCMotorSpeed for ${this.assignedName}`,
            (value: number) => this.Controller.setSpeed(value)
        );
        this.bluetoothHandler.registerMessageHandler(
            `setDCMotorColor for ${this.assignedName}`,
            (value: string) => this.Controller.setColor(value)
        );
        this.bluetoothHandler.registerMessageHandler(
            `stopDCMotorSpeed for ${this.assignedName}`,
            () => this.Controller.setSpeed(0)
        );
    }

    static hasInstanceWithId(id: string): boolean {
        return DCMotor.instances.has(id);
    }
}

export default DCMotor;