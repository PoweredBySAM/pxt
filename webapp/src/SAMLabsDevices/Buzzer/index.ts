import BuzzerController from "./Controller";
import * as simulator from "../../simulator";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class Buzzer {
    Controller: BuzzerController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, Buzzer>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new BuzzerController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        Buzzer.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setBuzzerVolume for ${this.assignedName}`,
            (value: number) => this.Controller.setVolume(value)
        );
        this.bluetoothHandler.registerMessageHandler(
            `setBuzzerPitch for ${this.assignedName}`,
            (value: number) => this.Controller.setPitch(value)
        );
        this.bluetoothHandler.registerMessageHandler(
            `clearBuzzer for ${this.assignedName}`,
            () => this.Controller.clear()
        );
        this.bluetoothHandler.registerMessageHandler(
            `setBuzzerColor for ${this.assignedName}`,
            (value: string) => this.Controller.setColor(value)
        );
    }

    static hasInstanceWithId(id: string): boolean {
        return Buzzer.instances.has(id);
    }
}

export default Buzzer;