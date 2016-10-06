import {Component, ElementRef, ViewChild, Inject} from '@angular/core';
import {Selection, SelectionObserver} from "../../../common/selection";
import {ViewVertex} from "../../../common/viewmodel";
import {Diagram} from "../../../common/layer";


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
export default class Inspector implements SelectionObserver<ViewVertex> {
    private categoryIndex = 1;
    private overlayMessage = 'No selection';

    public onSelectionBegin(selection: Selection<ViewVertex>) {
        this.overlayMessage = "Beginning selection";
    }

    public onSelectionUpdate(selection: Selection<ViewVertex>) {
        this.overlayMessage = selection.isEmpty() ? "Nothing selected" : `Selected ${selection.items.length} items`;
    }

    private onSelect(index: number) {
        if (index < 1 || index > 3) {
            return;
        } else {
            this.categoryIndex = index;
        }
    }

    constructor(@Inject('diagram') diagram: Diagram) {
        diagram.selection.subscribe(this);
    }
}