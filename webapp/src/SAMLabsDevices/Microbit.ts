import Controller from "../../../react-common/components/SAMLabsCommon/MicrobitController/Controller";
import * as simulator from "../simulator";
import { BluetoothConnectionHandler } from "./BluetoothConnectionHandler";
import BaseController from "../../../react-common/components/SAMLabsCommon/BaseController";

interface LEDValues {
    x: number;
    y: number;
}

interface ControllerWithEvents extends Controller {
    on(event: string, listener: (...args: any[]) => void): void;
}

class Microbit {
    Controller: ControllerWithEvents;
    assignedName: pxsim.SimulatorMessage;
    private bluetoothHandler: BluetoothConnectionHandler;
    static instances = new Map();

    constructor(id: pxsim.SimulatorMessage) {
        this.assignedName = id;
        this.Controller = new Controller() as ControllerWithEvents;
        this.bluetoothHandler = new BluetoothConnectionHandler(this.Controller as unknown as BaseController, this.assignedName);
        Microbit.instances.set(id, this);
        this.setupMessageHandlers();
        this.setupEventListeners();
    }

    private setupMessageHandlers(): void {
        this.bluetoothHandler.registerMessageHandler(
            `${this.assignedName} ledDisplayWord`,
            (value) => this.Controller.displayText(value as string)
        );

        this.bluetoothHandler.registerMessageHandler(
            `${this.assignedName} ledDisplayShape`,
            (value) => this.Controller.displayPattern(value as string)
        );

        this.bluetoothHandler.registerMessageHandler(
            `${this.assignedName} plot`,
            (value) => {
                const ledValue = value as LEDValues;
                this.Controller.plot(ledValue.x, ledValue.y);
            }
        );

        this.bluetoothHandler.registerMessageHandler(
            `${this.assignedName} unplot`,
            (value) => {
                const ledValue = value as LEDValues;
                this.Controller.unplot(ledValue.x, ledValue.y);
            }
        );

        this.bluetoothHandler.registerMessageHandler(
            `${this.assignedName} toggle`,
            (value) => {
                const ledValue = value as LEDValues;
                this.Controller.toggle(ledValue.x, ledValue.y);
            }
        );

        this.bluetoothHandler.registerMessageHandler(
            `${this.assignedName} clearLED`,
            () => this.Controller.clearLED()
        );
    }

    private setupEventListeners(): void {
        this.Controller.on("APressed", this.onAButtonDown);
        this.Controller.on("AReleased", this.onAButtonUp);
        this.Controller.on("BPressed", this.onBButtonDown);
        this.Controller.on("BReleased", this.onBButtonUp);
        this.Controller.on("temperatureChanged", this.onTemperatureChanged);
        this.Controller.on("accelerometerChanged", this.onAccelerometerChanged);
    }

    static hasInstanceWithId(id: any) {
        return Microbit.instances.has(id);
    }

    private onAButtonDown = () => {
        simulator.driver.samMessageToTarget({ type: `${this.assignedName} AButtonDown` });
    }

    private onAButtonUp = () => {
        simulator.driver.samMessageToTarget({ type: `${this.assignedName} AButtonUp` });
    }

    private onBButtonDown = () => {
        simulator.driver.samMessageToTarget({ type: `${this.assignedName} BButtonDown` });
    }

    private onBButtonUp = () => {
        simulator.driver.samMessageToTarget({ type: `${this.assignedName} BButtonUp` });
    }

    private onTemperatureChanged = () => {
        simulator.driver.samMessageToTarget({
            type: `${this.assignedName} temperatureChanged`,
            value: {
                temperature: this.Controller._temperature,
                isTemperatureChanged: this.Controller._isTemperatureChanged
            }
        });
    }

    private onAccelerometerChanged = () => {
        simulator.driver.samMessageToTarget({
            type: `${this.assignedName} accelerometerChanged`,
            value: {
                x: this.Controller._xAccel,
                y: this.Controller._yAccel,
                z: this.Controller._zAccel
            }
        });
    }
}

export default Microbit;
