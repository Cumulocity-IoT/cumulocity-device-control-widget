/**
 * /*
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
 *
 * @format
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { OperationService, IResult, IOperation, IManagedObject, InventoryService } from '@c8y/client';
import { WidgetHelper } from "./widget-helper";
import { WidgetConfig, DeviceOperation } from "./widget-config";
import * as _ from 'lodash';
import { Observable, Subscription, interval } from 'rxjs';

@Component({
    selector: "lib-device-control-widget",
    templateUrl: "./device-control-widget.component.html",
    styleUrls: ["./device-control-widget.component.css"],
})
export class DeviceControlWidget implements OnDestroy, OnInit {

    widgetHelper: WidgetHelper<WidgetConfig>;
    @Input() config;
    private timerObs: Observable<number>;
    private subs: Subscription[] = [];


    constructor(private operations: OperationService, private inventoryService: InventoryService) {
    }

    async ngOnInit(): Promise<void> {
        this.widgetHelper = new WidgetHelper(this.config, WidgetConfig); //default access through here
        this.updateDeviceStates();
        this.timerObs = interval(30000);
        this.subs.push(this.timerObs.subscribe(t => {
            this.updateDeviceStates();
        }));
        return;
    }

    async performOperation(mo: IManagedObject, op: DeviceOperation): Promise<void> {
        //let ops: IResult<IOperation> = await this.operations.detail('37661367');

        if (op.toggle) {
            //update the managed object to set the flag to the opposite of what it is currently
            console.log("INCOMING", mo);
            let flag: boolean = false;
            if (_.has(mo, op.source)) {
                console.log("FLAG", !mo[op.source]);
                flag = !mo[op.source];
            }

            const partialUpdateObject: Partial<IManagedObject> = {
                id: `${mo.id}`,
            };
            partialUpdateObject[op.source] = flag;

            console.log("sending update", partialUpdateObject);
            const { data, res } = await this.inventoryService.update(partialUpdateObject);

            console.log("SETTING", data[op.source]);
            console.log("RESULT", res);
            mo[op.source] = data[op.source];

        } else {

            let payload = op.payload;

            let operation: IOperation = {
                deviceId: mo.id,
                id: op.operation,
            };
            operation[op.operation] = payload;
            console.log("operation", operation);
            let ops: IResult<IOperation> = await this.operations.create(operation);
            console.log("RESP", ops);
        }
    }

    ngOnDestroy(): void {
        //unsubscribe from observables here
        this.subs.forEach(s => s.unsubscribe());
    }

    async updateDeviceStates(): Promise<void> {
        //here we just update the objects to refect their current state. 
        let ids: string[] = this.widgetHelper.getWidgetConfig().assets.map(mo => mo.id);
        this.widgetHelper.getWidgetConfig().assets = await this.widgetHelper.getDevices(this.inventoryService, ids);
        return;
    }

}

