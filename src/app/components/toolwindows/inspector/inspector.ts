import {Component, ElementRef, ViewChild, Inject} from '@angular/core';
import {Selection, SelectionObserver} from "../../../common/selection";
import {ViewNode} from "../../../common/viewmodel";
import {Diagram} from "../../../common/layer";
import {ToolWindow} from "../toolwindow";


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
export class Inspector implements SelectionObserver<ViewNode>, ToolWindow {
    categoryIndex = 1;
    overlayMessage = 'No selection';
    title = "Inspector";
    
    selection: Selection<ViewNode>;

    initialize(diagram: Diagram) {
        this.selection = diagram.selection;
        this.selection.subscribe(this);
    }

    onSelectionBegin(selection: Selection<ViewNode>) {
        this.overlayMessage = "Beginning selection";
    }

    onSelectionUpdate(selection: Selection<ViewNode>) {
        this.overlayMessage = selection.empty ? "Nothing selected" : `Selected ${selection.items.length} items`;
    }

    private onSelect(index: number) {
        this.categoryIndex = (index < 1) ? 1 : (index > 3) ? 3 : index;
    }
}