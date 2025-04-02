import SliderController from "./Controller";
import * as simulator from "../../simulator";
import { BluetoothConnectionHandler } from "../BluetoothConnectionHandler";

class Slider {
    Controller: SliderController;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map<string, Slider>();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new SliderController('#00FF00');
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller, this.assignedName);
        Slider.instances.set(String(id), this);

        this.bluetoothHandler.registerMessageHandler(
            `setSliderColor for ${this.assignedName}`,
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
        return Slider.instances.has(id);
    }
}

export default Slider;