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
import { OperationService, OperationStatus, IOperation, IManagedObject, InventoryService } from '@c8y/client';
import { WidgetHelper } from "./widget-helper";
import { WidgetConfig, DeviceOperation } from "./widget-config";
import * as _ from 'lodash';
import { Observable, Subscription, interval } from 'rxjs';
import { AlertService } from '@c8y/ngx-components';

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


    constructor(private operations: OperationService, private inventoryService: InventoryService, private alertService: AlertService) {
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
            const { data, res } = await this.inventoryService.update(partialUpdateObject);

            if (res.status === 200) {
                this.alertService.success(`operation ${op.name} for ${mo.name} successful`);
                mo[op.source] = data[op.source];
            } else {
                let reason = await res.text();
                this.alertService.danger(`operation ${op.name} for ${mo.name} failed, reason: ${reason}`);
            }


        } else {
            try {
                console.log(op.payload);
                let payload = JSON.parse(op.payload);
                console.log(payload);

                let operation: IOperation = {
                    deviceId: mo.id,
                    id: op.operation,
                };
                operation[op.operation] = payload;
                console.log("operation", operation);

                let { data, res } = await this.operations.create(operation);
                console.log("operation res", res);

                if (res.status >= 200 && res.status < 300) {

                    if (data.status) {
                        if (data.status == OperationStatus.SUCCESSFUL) {
                            this.alertService.success(`operation ${op.name} for ${mo.name} is ${data.status}`);
                        } else if (data.status == OperationStatus.PENDING || data.status == OperationStatus.PENDING) {
                            this.alertService.warning(`operation ${op.name} for ${mo.name} is ${data.status}`);
                        } else {
                            this.alertService.danger(`operation ${op.name} for ${mo.name} is ${data.status}`);
                        }
                    } else {
                        this.alertService.success(`operation ${op.name} for ${mo.name} run`);
                    }
                } else {
                    this.alertService.danger(`operation ${op.name} for ${mo.name} failed, reason: ${res}`);
                }
                console.log("RESP", data);

            } catch (e) {
                console.log("ERROR", e);
                this.alertService.danger(`operation ${op.name} for ${mo.name} failed, reason: ${e}`);
            }
        }
    }

    ngOnDestroy(): void {
        //unsubscribe from observables here
        this.subs.forEach(s => s.unsubscribe());
    }

    async updateDeviceStates(): Promise<void> {
        //here we just update the objects to refect their current state. 
        let ids: string[] = this.widgetHelper.getWidgetConfig().assets.map(mo => mo.id);
        let newAssets = await this.widgetHelper.getDevices(this.inventoryService, ids);
        this.widgetHelper.getWidgetConfig().assets = newAssets.sort((a, b) => a.name.localeCompare(b.name));
        return;
    }

}

