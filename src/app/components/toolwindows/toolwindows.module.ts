import { NgModule } from '@angular/core';

import Palette from "./palette/palette";
import Dataview from "./data/dataview";
import Inspector from "./inspector/inspector";
import Explorer from "./explorer/explorer";

/**
 * Toolwindow module
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@NgModule({
    imports: [],
    exports: [],
    declarations: [
        Inspector,
        Palette,
        Dataview,
        Explorer
    ],
    providers: [],
})
export class ToolwindowsModule { }
