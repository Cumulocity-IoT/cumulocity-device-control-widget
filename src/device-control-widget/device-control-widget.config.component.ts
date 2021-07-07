/*
* Copyright (c) 2019 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
 */
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { WidgetHelper } from "./widget-helper";
import { WidgetConfig } from "./widget-config";
import { OperationService, IResultList, IResult, IOperation, IManagedObject, InventoryService } from '@c8y/client';
import * as _ from "lodash";
import { of } from 'rxjs';


@Component({
    selector: "device-control-widget-config-component",
    templateUrl: "./device-control-widget.config.component.html",
    styleUrls: ["./device-control-widget.config.component.css"]
})
export class DeviceControlWidgetConfig implements OnInit, OnDestroy {

    //members
    rawDevices: IManagedObject[];

    public CONST_HELP_IMAGE_FILE =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADdgAAA3YBfdWCzAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAATzSURBVGiB7VlrTBxVFP7usLu8kUeBLSAFipUqFg1Qq5EgaCU2/DAxpYqJCVExmNC0Km1jolmbxgSCKbWoITG+oq1Ba6M1mvQHqxJTEyS0aEBiSyvIY2F5dl32Mczxh1WZndmdubOoTeD7d88995zvzH2cM/cC61jH2gZbFSs2m2B1l5VIEMoYUArgFgBZAa5GARogRj0CE7ono77uhc0mhes6rAAyD9iz/MQamUCPgZDJOXwUhA9FUWqfOXrfmFEOhgLIPtSd5JXEwwCeAhBp1Pk1eMDQ4fXCNt9WMc87mDsA68GuGiLWDiCVd6wGHAR6Zqql8lOeQfoDqP/BnJ7oageonpsaB4jw+lQs9sFWIerR1xVAqs0eJyyxUyB6IDx6+kDAV0zy7Xa0Vv2upStoKeQ3fhkpuPHFf0UeABjwIATLmVttnRYtXc0AXFFRRwGUrwozPlQ4l1JbtJRCLqH0JvseMHy0epz4QaCHQ23soAFsOHA2I4JZBkGUoNcZY8CO3CRUF1lRdGM8Yi0mAIBPlHBx2o2uwWmc6XfAJ/LkLzYLybvV0Vo1pdZrCjYsAubDPOQTos048lAB7t6cpNqfEmfBnbmJqN2RiYOfDOLilOb+vAZKZoLlZQANar2qM2A9ZM8hCb8gRIArYRIYOh7fhqKsG3RRcrp8qOnoxeKSX5c+AH8EE/PHm3eOBHaobmJaxtPQSR4AqovSFeRFidBzZR7nhufg9i/L+jbEWVC7navyMC+TSTX/KAOw2U1gqOOxvqswTdb2ixLq37+Ahg/60XjiR9S8qfza5VuSeVwAYHXY3RkRKFUEkLYkbQeQzmM6LzVW1u4amkH/b4t/tycXPbAPzch0spKjeVwAoAxrbkpxoFQRACOhgtMyEmPMsvbo7JJCx+WVVwbE6wQAoOSmts5LeM2WHPlWU6d4k3yPXJ7WewqtAENpoEhtE9/Ebzk0HinNRIE1Xib7/LyD2w4RtgTKVAJgG7kth0B1UTr278yTyfpGFnC6b8KIOQU3tSUUZ8SyGmpKMtBUlQ+2Ittcdrrx3McDkIxtgvhAgcoM0Kr8J2/LSsDzVZtl5H+dcWPvyZ94Epgm1JbQ1dUw3HBvDoQV7CcWPHjyvQuYWPCEY1bBTW0GDC3OlYiLNOGObPmp8+JnQ5hzh/3lFdyUeYDh53C9bEqJgUn45+uPz3twfmQhXLOACjdFAEToC9dPQpQ841+adodrEgDACL2BMsUpREyyM9L8UQuJc8NzupIbPyR7oETBdCq6+3uAKcrW/x9seLKlsidQqlKN2iQQnQjHlUlgaCjPwbt1t+N47W3YulFxfBsAnQSYInuo/w+Yl9sAKCsyndhTmoknyrJRmJmAu/KS8NqjhYgxKyphHrgiltGm1qEawNQr9zuI8LZRb8U5ibJ2UowZeWmxQbR14a3xVyucah1Bd6voWXoBKueuHozNySdPlMh4AmMYW4b5pWDdQQOYPb5rEYT9Rny+890oBib+TJp+UULr2UuYcfmMmAIR7XW23BO0OtCse6xNXW8QY6o3AlrYEGfBVa8Ir9/gMwDDMUdzxb5QKpoH/uQVZyMYThvx73T5DJNnDKcc0d88q6mnx9j1fLm7Nq7XV+J6e+DgLnommys7IwXTzQDaAXh5x6vAA4ZjXh8KeMkDa/WRT4Hgz6x/3fTO/VvPrOtYx1rHHxm4yOkGvwZ0AAAAAElFTkSuQmCC";

    widgetHelper: WidgetHelper<WidgetConfig>;

    constructor(public operations: OperationService, public inventory: InventoryService) { }

    async getDevicesWithOperations(): Promise<IResultList<IManagedObject>> {
        const filter: object = {
            pageSize: 2000,
            withTotalPages: true,
            query: "has(c8y_supportedOperations)",
        };

        const query = {
            name: "*",
        };

        //const { data, res, paging } = await
        return this.inventory.listQueryDevices(query, filter);
    }

    async getDevicesAndGroups(): Promise<IManagedObject[]> {
        let retrieved: IManagedObject[] = [];

        const filter2: object = {
            pageSize: 2000,
            withTotalPages: true,
            query: "((not(has(c8y_IsDynamicGroup.invisible))) and ((type eq 'c8y_DeviceGroup') or (type eq 'c8y_DynamicGroup') or has( c8y_IsDeviceGroup ) or has(c8y_Connection) ))",
        };

        let result = await this.inventory.list(filter2);
        if (result.res.status === 200) {
            do {
                result.data.forEach((mo) => {
                    _.set(mo, "isGroup", true);
                    retrieved.push(mo);
                });

                if (result.paging.nextPage) {
                    result = await result.paging.next();
                }
            } while (result.paging && result.paging.nextPage);
        }

        result = await this.getDevicesWithOperations();
        if (result.res.status === 200) {
            do {
                result.data.forEach((mo) => {
                    _.set(mo, "isGroup", false);
                    retrieved.push(mo);
                });

                if (result.paging.nextPage) {
                    result = await result.paging.next();
                }
            } while (result.paging && result.paging.nextPage);
        }
        return retrieved;
    }

    getDeviceDropdownList$() {

        return of(this.rawDevices);
    }

    async ngOnInit(): Promise<void> {
        this.widgetHelper = new WidgetHelper(this.config, WidgetConfig); //default access through here

        this.rawDevices = await this.getDevicesAndGroups();
        console.log(this.rawDevices);

        // let ops: IResult<IOperation> = await this.operations.detail('37661367');
        let operation: IOperation = {
            deviceId: '37661367',
            id: 'jbhStart',
            jbhStart: {
                prop1: "doIt"
            }
        };

        let ops: IResult<IOperation> = await this.operations.create(operation);
        console.log(ops);
        // const options: IFetchOptions = {
        //     method: 'GET',
        //     headers: { 'Content-Type': 'application/json' }
        // };
        // const response = await this.client.fetch('/service/my-service', options); // Fetch API Response
    }

    handleImage(e) {
        console.log("EVENT", e);
        const selectedImage = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => { this.widgetHelper.getWidgetConfig().myImage = reader.result.toString(); this.onConfigChanged(); };
        reader.onerror = error => console.log(error);
        reader.readAsDataURL(selectedImage);
    }

    ngOnDestroy(): void {
        //unsubscribe from observables here
    }


    @Input() config: any = {};

    onConfigChanged(): void {
        console.log("CONFIG-CHANGED");
        console.log(this.config);
        this.widgetHelper.setWidgetConfig(this.config); //propgate changes 
    }
}