import {Component} from '@angular/core';
import {Selection, SelectionObserver} from "../../../common/selection";
import {ViewNode} from "../../../common/viewmodel";
import {Style} from "../../../common/styling";
import {Diagram} from "../../../common/layer";
import {ToolWindow} from "../toolwindow";
import {ModelService} from "../../../services/models";


/**
 * Inspector tool window.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'inspector',
    template: require('./inspector.html'),
    styles: [require('./inspector.scss')]
})
export class Inspector implements SelectionObserver<ViewNode>, ToolWindow<Diagram> {
    categoryIndex = 1;
    overlayMessage = 'No selection';
    title = "Inspector";
    selection = new Selection<ViewNode>();
    activeStyles: Array<Style> = [];
    activeStyle: Style;

    initialize(diagram: Diagram) {
        setTimeout(() => {
            this.selection = diagram.selection;
            this.selection.subscribe(this);
        });
    }

    onSelectionBegin(selection: Selection<ViewNode>) {
        this.overlayMessage = "Beginning selection";
    }

    onSelectionUpdate(selection: Selection<ViewNode>) {
        this.overlayMessage = selection.empty ? "Nothing selected" : `Selected ${selection.items.length} items`;
    }

    onSelect(index: number) {
        this.categoryIndex = (index < 1) ? 1 : (index > 3) ? 3 : index;
    }

    constructor(models: ModelService) {
        /*
        models.fetchFormalisms('*').subscribe(formalisms => {
            formalisms.forEach(formalism => {
                this.activeStyles = formalism.syntax[0].styles;
            });
            this.activeStyle = this.activeStyles[1] || null;
        });
        */
    }
}
