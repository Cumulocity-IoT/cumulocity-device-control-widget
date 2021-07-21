/** @format */

import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule as NgRouterModule } from "@angular/router";
import { UpgradeModule as NgUpgradeModule } from "@angular/upgrade/static";
import { CoreModule, HOOK_COMPONENTS, RouterModule } from "@c8y/ngx-components";
import { DashboardUpgradeModule, UpgradeModule, HybridAppModule, UPGRADE_ROUTES } from "@c8y/ngx-components/upgrade";
import { AssetsNavigatorModule } from "@c8y/ngx-components/assets-navigator";
import { CockpitDashboardModule } from "@c8y/ngx-components/context-dashboard";
import { ReportsModule } from "@c8y/ngx-components/reports";
import { SensorPhoneModule } from "@c8y/ngx-components/sensor-phone";
import { DeviceControlWidgetConfig } from "./src/device-control-widget/device-control-widget.config.component";
import { DeviceControlWidget } from "./src/device-control-widget/device-control-widget.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { SafeImage } from "./src/device-control-widget/safeImage.pipe";

@NgModule({
    imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot(),
        NgRouterModule.forRoot([...UPGRADE_ROUTES], { enableTracing: false, useHash: true }),
        CoreModule.forRoot(),
        AssetsNavigatorModule,
        ReportsModule,
        NgUpgradeModule,
        DashboardUpgradeModule,
        CockpitDashboardModule,
        SensorPhoneModule,
        UpgradeModule,
        NgSelectModule,
    ],
    declarations: [DeviceControlWidget, DeviceControlWidgetConfig, SafeImage],
    entryComponents: [DeviceControlWidget, DeviceControlWidgetConfig],
    providers: [
        {
            provide: HOOK_COMPONENTS,
            multi: true,
            useValue: [
                {
                    id: "com.softwareag.globalpresales.device.control.widget",
                    label: "Device Control Widget",
                    description: "widget to show devices status and allow operations to be performed.",
                    component: DeviceControlWidget,
                    configComponent: DeviceControlWidgetConfig,
                    previewImage: require("@widget-assets/img-preview.png"),
                    data: {
                        ng1: {
                            options: {
                                noDeviceTarget: true,
                                noNewWidgets: false,
                                deviceTargetNotRequired: true,
                                groupsSelectable: true
                            },
                        }
                    }
                },
            ],
        },

    ],
})
export class AppModule extends HybridAppModule {
    constructor(protected upgrade: NgUpgradeModule) {
        super();
    }
}
