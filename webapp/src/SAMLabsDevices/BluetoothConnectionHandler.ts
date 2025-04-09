import * as simulator from "../simulator";
import BaseController from "../../../react-common/components/SAMLabsCommon/BaseController";

type MessageHandler = (value: unknown) => void;

export class BluetoothConnectionHandler {
    private controller: BaseController;
    private assignedName: pxsim.SimulatorMessage;
    private customMessageHandlers: Map<string, MessageHandler>;

    constructor(controller: BaseController, assignedName: pxsim.SimulatorMessage) {
        this.controller = controller;
        this.assignedName = assignedName;
        this.customMessageHandlers = new Map();
        this.setupEventListeners();
        this.setupMessageListener();
    }

    private setupEventListeners(): void {
        this.controller.on('connected', () => {
            simulator.driver.samMessageToTarget({ 
                type: `${this.assignedName} bluetoothConnected`,
                value: this.controller._deviceHexId 
            });
        });

        this.controller.on('bluetoothError', () => {
            simulator.driver.samMessageToTarget({ 
                type: `${this.assignedName} bluetoothConnectionErr` 
            });
        });

        this.controller.on('bluetoothCancelled', () => {
            simulator.driver.samMessageToTarget({ 
                type: `${this.assignedName} bluetoothCancelled` 
            });
        });

        this.controller.on('disconnected', () => {
            simulator.driver.samMessageToTarget({ 
                type: `${this.assignedName} bluetoothDisconnected` 
            });
        });

        this.controller.on('hexValueError', (invalidHex: string) => {
            simulator.driver.samMessageToTarget({ 
                type: `${this.assignedName} hexValueError`,
                value: invalidHex
            });
        });
    }

    private setupMessageListener(): void {
        window.addEventListener("message", (ev: MessageEvent<{ type: string; value?: unknown }>) => {
            if (ev.data.type === `${this.assignedName} hydrate`) {
                this.handleHydrate();
            }
            if (ev.data.type === `${this.assignedName} connect`) {
                console.log("connect", ev.data.value);
                this.handleConnect(ev.data.value as string | undefined);
            }
            if (ev.data.type === `${this.assignedName} disconnect`) {
                this.handleDisconnect();
            }
            
            const handler = this.customMessageHandlers.get(ev.data.type);
            if (handler) {
                handler(ev.data.value);
            }
        }, false);
    }

    public handleHydrate(): void {
        if (this.controller._isConnected) {
            simulator.driver.samMessageToTarget({ 
                type: `${this.assignedName} bluetoothIsConnected`,
                value: this.controller._deviceHexId 
            });
        }
    }

    public handleConnect(hexValue?: string): void {
        this.controller.connect(() => {}, hexValue);
    }

    public handleDisconnect(): void {
        this.controller.disconnect();
    }

    public registerMessageHandler(messageType: string, handler: MessageHandler): void {
        this.customMessageHandlers.set(messageType, handler);
    }
} 