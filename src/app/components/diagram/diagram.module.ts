import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoaderModule} from '../loader/loader.module';
import {GridLayer, BorderLayer, NodeLayer, PlatformLayer, EffectLayer} from './layers/layers';
import Overview from "./layers/overview/overview";
import Presenter from "./layers/controls/presenter";
import Breadcrumbs from './layers/breadcrumbs/breadcrumbs';
import Diagram from './diagram';

/**
 * Diagram module.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@NgModule({
    imports: [CommonModule, LoaderModule],
    exports: [ Diagram ],
    declarations: [
        Breadcrumbs, 
        Presenter, 
        Overview, 
        EffectLayer, 
        NodeLayer,
        BorderLayer,
        GridLayer,
        Diagram
    ],
    providers: [],
})
export class DiagramModule { }
