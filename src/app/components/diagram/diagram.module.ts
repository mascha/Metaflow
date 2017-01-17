import {NgModule, ElementRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoaderModule} from '../loader/loader.module';
import {GridLayer, BorderLayer, EffectLayer} from './layers/layers';
import {Overview} from "./layers/overview/overview";
import {Presenter} from "./layers/controls/presenter";
import {Breadcrumbs} from './layers/breadcrumbs/breadcrumbs';
import DiagramImpl from './diagram';


/**
 * Diagram module.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@NgModule({
    imports:      [ CommonModule, LoaderModule ],
    exports:      [ DiagramImpl ],
    declarations: [ Breadcrumbs, Presenter, Overview, EffectLayer, BorderLayer, GridLayer, DiagramImpl ],
    providers:    [ {provide: 'diagram', useClass: DiagramImpl }]
})
export class DiagramModule { }
