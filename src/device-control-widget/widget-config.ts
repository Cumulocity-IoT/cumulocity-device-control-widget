/** @format */

//
// Helper classes and interfaces
//
import * as path from 'path';
import { IManagedObject } from '@c8y/client';


interface Device {
    name: string;
    mo: IManagedObject;
}

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

    deviceList: Array<Device>;
    operationList: Array<DeviceOperation>;
    selectedDevices: any[];
    myValue: string;
    myImage: any;

    /**
     *  Create an instance of the config object
     */
    constructor() {
        this.deviceList = [];
        this.operationList = [];
        this.selectedDevices = [];

        this.myValue = "Default value in config";
        this.myImage = require("@widget-assets/img-preview.png");
    }
}
