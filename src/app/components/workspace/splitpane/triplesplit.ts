import {Component, ElementRef, ViewChild, Renderer} from "@angular/core";
import HTML from "../../../common/utility";

/**
 * Three column split pane.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'triple-split',
    template: require('./triplesplit.html'),
    styles: [require('./splitpane.scss')]
})
export default class TripleSplit {
    leftPos = 16;
    rightPos = 84;
    centerWidth = 84 - 16;
    leftVisible = true;
    rightVisible = true;

    private primaryDrag: boolean;
    private removeMove: Function;
    private removeUp: Function;

    private moveHandler = (event: MouseEvent) => {
        let element = this.root.nativeElement;
        if (element) {
            let offsetX = HTML.getOffset(element, event).x;
            let relatiX = offsetX / element.offsetWidth * 100;
            this.handleAdjust(Math.round(relatiX));
            HTML.block(event);
        }
    };

    private upHandler = (event: MouseEvent) => {
        this.removeMove();
        this.removeUp();
        HTML.block(event);
    };

    private keyHandler = (event: KeyboardEvent) => {
        if (event.which == 27) {
            
        }
    };

    onMouseDown(event: MouseEvent, primaryDrag: boolean) {
        this.removeMove = this.renderer.listenGlobal('document', 'mousemove', this.moveHandler);
        this.removeUp = this.renderer.listenGlobal('document', 'mouseup', this.upHandler);
        this.primaryDrag = primaryDrag;
        HTML.block(event);
    }

    /**
     * TODO implement hiding
     * @param event
     * @param primary
     */
    toggleVisibility(event: any, primary: boolean) {
        /* TODO NOP for now */
    }

    private handleAdjust(adjusted: number) {
        if (this.primaryDrag) {
            this.adjustBoth(adjusted, this.rightPos);
        } else {
            this.adjustBoth(this.leftPos, adjusted);
        }
    }

    private adjustBoth(l: number, r: number) {
        let left = (l < 0) ? 0 : (l > 100) ? 100 : l;
        let right = (r < 0) ? 0 : (r > 100) ? 100 : r;
        let adjLeft = Math.min(left, right);
        let adjRight = Math.max(left, right);
        let doLeft = true;
        let doRight = true;
        if (doLeft) { this.setLeft(adjLeft); }
        if (doRight) { this.setRight(adjRight); }
        if (doRight || doLeft) {
            let diff = Math.max(0, adjRight-adjLeft);
            this.setMiddle(diff);
        }
        HTML.dispatchResizeEvent();
    }

    private setRight(right: number) {
        this.rightPos = right;
    }

    private setLeft(left: number) {
        this.leftPos = left;
    }

    private setMiddle(width: number) {
        this.centerWidth = width;
    }

    constructor(private renderer: Renderer,
                private root: ElementRef) {}
}
