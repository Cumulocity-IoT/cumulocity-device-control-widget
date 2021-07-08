import { Injectable } from '@angular/core';
import { IResultList, IManagedObject, InventoryService } from '@c8y/client';
import * as _ from "lodash";

@Injectable({
    providedIn: 'root',
})
export class DeviceService {

    constructor(public inventory: InventoryService) { }

    async getDevicesWithOperations(): Promise<IResultList<IManagedObject>> {
        const filter: object = {
            pageSize: 2000,
            withTotalPages: true,
            query: "has(c8y_SupportedOperations)",
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


}