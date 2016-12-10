import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import Palette from "./palette/palette";
import Dataview from "./data/dataview";
import {Inspector} from "./inspector/inspector";
import {Explorer} from "./explorer/explorer";
import PropertySheet from './inspector/propertysheet/propertysheet';

/**
 * Toolwindow module
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        Inspector,
        Palette,
        Dataview,
        Explorer
    ],
    declarations: [
        PropertySheet,
        Inspector,
        Palette,
        Dataview,
        Explorer
    ],
    providers: [],
})
export class ToolWindowModule { }
