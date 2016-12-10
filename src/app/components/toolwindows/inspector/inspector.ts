import {Component, ElementRef, ViewChild, Inject} from '@angular/core';
import {Selection, SelectionObserver} from "../../../common/selection";
import {ViewVertex} from "../../../common/viewmodel";
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
export class Inspector implements SelectionObserver<ViewVertex>, ToolWindow {
    categoryIndex = 1;
    overlayMessage = 'No selection';
    title = "Inspector";
    
    selection = {
        empty: false
    }

    public onSelectionBegin(selection: Selection<ViewVertex>) {
        this.overlayMessage = "Beginning selection";
    }

    public onSelectionUpdate(selection: Selection<ViewVertex>) {
        this.overlayMessage = selection.empty ? "Nothing selected" : `Selected ${selection.items.length} items`;
    }

    private onSelect(index: number) {
        this.categoryIndex = (index < 1) ? 1 : (index > 3) ? 3 : index;
    }
}