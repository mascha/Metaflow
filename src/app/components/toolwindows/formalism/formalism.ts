import {Component, Inject} from '@angular/core';
import {ViewGroup} from "../../../common/viewmodel";
import {Diagram} from "../../../common/layer";
import {ToolWindow} from "../toolwindow"
import {ModelService} from "../../../services/models";

/**
 * A project navigator/explorer.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'formalism',
    template: require('./formalism.html'),
    styles: [require('./formalism.scss')],
})
export class Formalism implements ToolWindow<Diagram> {
    title = "Metamodel";

    formalisms: Array<any>;

    initialize(diagram: Diagram) {
        /* NOP */
    }

    constructor(private models: ModelService) {
        models.fetchFormalisms("*").subscribe(f => this.formalisms = f);
    }
}
