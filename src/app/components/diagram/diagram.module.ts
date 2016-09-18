import { NgModule } from '@angular/core';

import Overview from "./overview/overview";
import Presenter from "./controls/presenter";
import Breadcrumbs from './breadcrumbs/breadcrumbs'

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
    ],
    providers: [],
})
export class DiagramModule { }
