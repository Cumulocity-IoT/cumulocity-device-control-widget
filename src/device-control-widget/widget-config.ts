/** @format */

//
// Helper classes and interfaces
//
import { IManagedObject } from '@c8y/client';
import { Observable, of } from 'rxjs';
import * as _ from "lodash";


//there will be a finite set of operations which can be represented 
//by "buttons" on the front screen 
interface DeviceOperation {
    name: string;
    image: string;
}



/**
 * This class will contain all the bespoke config for the widget
 */
export class WidgetConfig {
    /**
     * Members for the config
     * widgetConfiguration.myValue
     */

    operationList: Map<string, string>;
    selectedDevices: IManagedObject[];
    selectedOperations: string[];
    deviceIcons: Map<string, string>;
    deviceImageHeight: number;
    deviceImageWidth: number;
    deviceColumns: number;

    /**
     *  Create an instance of the config object
     */
    constructor() {
        this.operationList = new Map();
        this.selectedDevices = [];
        this.selectedOperations = [];
        this.deviceIcons = new Map();
        this.deviceImageHeight = 50;
        this.deviceImageWidth = 50;
        this.deviceColumns = 3;
        this.deviceIcons['default-device'] = require("@widget-assets/iot-sensor-icon.jpg");
        this.deviceIcons['default-operation'] = {
            key: "fa-power-off", name: "Power Off", code: "f011", filter: ["on"]
        };
    }

    imageWidth(): string {
        return this.deviceImageWidth + "px";
    }
    imageHeight(): string {
        return this.deviceImageHeight + "px";
    }

    setCols(x: number): void {
        this.deviceColumns = x;
    }

    setImageSize(x: number): void {
        this.deviceImageWidth = x;
        this.deviceImageHeight = x;
    }

    columnsInWidget(): string {
        let style: string = "";
        for (let index = 0; index < this.deviceColumns; index++) {
            style += 'auto ';
        }
        return style;
    }

    operationIcon(op: string): string {
        if (!_.has(this.deviceIcons, op)) {
            this.deviceIcons[op] = this.deviceIcons['default-operation'];
        }
        else
            return 'fa ' + this.deviceIcons[op].key + ' fa-lg';
    }

    operationPayload(op: string): string {
        if (!_.has(this.deviceIcons, op)) {
            this.deviceIcons[op] = "{}";
        }
        return this.operationList[op];
    }
    deviceIcon(op: string): string {
        if (_.has(this.deviceIcons, op)) {
            return this.deviceIcons[op];
        }
        return this.deviceIcons['default-device'];
    }

    selectedDevices$(): Observable<IManagedObject[]> {
        return of(this.selectedDevices);
    }

    selectedOperations$(): Observable<string[]> {
        return of(this.selectedOperations);
    }
}
