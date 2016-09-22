import { NgModule } from '@angular/core';

import {GridLayer, BorderLayer, NodeLayer, PlatformLayer, EffectLayer} from './layers/layers';
import Overview from "./layers/overview/overview";
import Presenter from "./layers/controls/presenter";
import Breadcrumbs from './layers/breadcrumbs/breadcrumbs';

/**
 * Diagram module.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@NgModule({
    imports: [],
    exports: [],
    declarations: [
        Breadcrumbs, 
        Presenter, 
        Overview, 
        EffectLayer, 
        NodeLayer,
        BorderLayer,
        GridLayer
    ],
    providers: [],
})
export default class DiagramModule { }
