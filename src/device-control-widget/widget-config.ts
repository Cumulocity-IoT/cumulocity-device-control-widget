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
    selectedDevices: IManagedObject[]; //can include groups
    assets: IManagedObject[]; //should be just devices
    selectedOperations: string[];
    deviceSettings: Map<string, string>;
    deviceImageHeight: number;
    deviceImageWidth: number;
    deviceColumns: number;

    /**
     *  Create an instance of the config object
     */
    constructor() {
        this.operationList = new Map();
        this.selectedDevices = [];
        this.assets = [];
        this.selectedOperations = [];
        this.deviceSettings = new Map();
        this.deviceImageHeight = 50;
        this.deviceImageWidth = 50;
        this.deviceColumns = 3;
        this.deviceSettings['default-device'] = require("@widget-assets/iot-sensor-icon.jpg");
        this.deviceSettings['default-operation'] = {
            key: "fa-power-off", name: "Power Off", code: "f011", filter: ["on"]
        };
        this.deviceSettings['heartbeat'] = {
            "key": "fa-heartbeat",
            "name": "Heartbeat",
            "code": "f21e",
            "filter": [
                "ekg"
            ]
        };
    }

    validOperation(mo: IManagedObject, op: string): boolean {
        if (_.has(mo, "c8y_SupportedOperations")) {
            if (mo.c8y_SupportedOperations.includes(op)) {
                return true;
            }
        }
        return false;
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

    deviceStatus(mo: IManagedObject): string {
        if (_.has(mo, "c8y_Availability")) {
            if (mo["c8y_Availability"].status === "UNAVAILABLE") {
                return "badge-danger";
            } else if (mo["c8y_Availability"].status === "AVAILABLE" && _.has(mo, "sag_IsShutDown")) {
                return "badge-warning";
            } else if (mo["c8y_Availability"].status === "AVAILABLE") {
                return "badge-success";
            } else if (mo["c8y_Availability"].status === "MAINTENANCE") {
                return "badge-warning";
            }
            return "badge-primary";
        }
        return "badge-success";
    }

    alarmStatus(mo: IManagedObject): string {
        let ac = this.getAlarmCount(mo);
        if (ac > 0) {
            return "badge-danger";
        }
        return "badge-success";
    }

    deviceStatusLabel(mo: IManagedObject): string {
        if (_.has(mo, "c8y_Availability")) {
            if (mo["c8y_Availability"].status === "AVAILABLE" && _.has(mo, "sag_IsShutDown")) {
                return "AVAILABLE (STANDBY)";
            }
            return mo["c8y_Availability"].status;
        }
        return "AVAILABLE";
    }

    operationIcon(op: string): string {
        if (!_.has(this.deviceSettings, op)) {
            this.deviceSettings[op] = this.deviceSettings['default-operation'];
        }
        else
            return 'fa ' + this.deviceSettings[op].key + ' fa-lg';
    }

    operationPayload(op: string): string {
        if (!_.has(this.operationList, op)) {
            this.operationList[op] = `value`;
        }
        return this.operationList[op];
    }
    deviceIcon(op: string): string {
        if (_.has(this.deviceSettings, op)) {
            return this.deviceSettings[op];
        }
        return this.deviceSettings['default-device'];
    }

    selectedDevices$(): Observable<IManagedObject[]> {
        return of(this.selectedDevices);
    }

    selectedOperations$(): Observable<string[]> {
        return of(this.selectedOperations);
    }

    getAlarmCount(device) {
        let countAlarms = 0;

        if (_.has(device, 'c8y_ActiveAlarmsStatus')) {

            const alarmStatus = _.get(device, 'c8y_ActiveAlarmsStatus');
            _.forEach(_.values(alarmStatus), alarmCount => {
                countAlarms += alarmCount;
            });
        }
        return countAlarms;
    }
}
