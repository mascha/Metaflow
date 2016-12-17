import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import Palette from "./palette/palette";
import Dataview from "./data/dataview";
import {Inspector} from "./inspector/inspector";
import {Explorer} from "./explorer/explorer";
import {Issues} from "./issues/issues";
import PropertySheet from './inspector/propertysheet/propertysheet';
import {VsFor} from 'ng2-vs-for';

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
        Explorer,
        Issues
    ],
    declarations: [
        PropertySheet,
        Inspector,
        Palette,
        Dataview,
        Explorer,
        Issues,
        VsFor
    ],
    providers: []
})
export class ToolWindowModule { }
