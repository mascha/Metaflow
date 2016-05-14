import {Component, ElementRef, ViewChild, Renderer, Inject, Input} from "@angular/core";
import HTML from "../../common/html";

/**
 * Three column split pane.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'triple-split',
    template: require('./triplesplit.html'),
    styles: [require('./splitpane.scss')]
})
export default class TripleSplit {
    @ViewChild('root') root: ElementRef;
    @ViewChild('leftC') leftC: ElementRef;
    @ViewChild('leftDivider') leftDiv: ElementRef;
    @ViewChild('rightDivider') rightDiv: ElementRef;
    @ViewChild('rightC') rightC: ElementRef;
    @ViewChild('centerContent') center: ElementRef;

    private lastLeft = 15 + 1;
    private lastRight = 85 - 1;
    private primaryDrag: boolean;

    private moveHandler = (event: MouseEvent) => {
        let element = this.root.nativeElement;
        let offsetX = HTML.getOffset(element, event).x;
        let relatiX = offsetX / element.offsetWidth * 100;
        let adjusted = Math.round(relatiX);
        this.handleAdjust(adjusted);
        HTML.block(event);
    };

    private upHandler = (event: MouseEvent) => {
        document.removeEventListener('mousemove', this.moveHandler, true);
        document.removeEventListener('mouseup', this.upHandler, true);
        HTML.block(event);
    };

    ngAfterViewInit() {
        this.adjustBoth(15, 85);
    }

    onMouseDown(event: MouseEvent, primaryDrag: boolean) {
        document.addEventListener('mousemove', this.moveHandler, true);
        document.addEventListener('mouseup', this.upHandler, true);
        this.primaryDrag = primaryDrag;
        HTML.block(event);
    }

    toggleVisibility(event: any, primary: boolean) {

    }

    private handleAdjust(adjusted: number) {
        if (this.primaryDrag) {
            this.adjustBoth(adjusted, this.lastRight);
        } else {
            this.adjustBoth(this.lastLeft, adjusted)
        }
    }

    private adjustBoth(l: number, r: number) {
        let left = (l < 0)? 0 : (l > 100) ? 100 : l;
        let right = (r < 0)? 0 : (r > 100) ? 100 : r;
        let adjLeft = Math.min(left, right);
        let adjRight = Math.max(left, right);

        let doLeft = Math.abs(this.lastLeft - adjLeft) > 0;
        let doRight = Math.abs(this.lastRight - adjRight) > 0;

        if (doLeft) { this.setLeft(adjLeft); }
        if (doRight) { this.setRight(adjRight);}
        if (doRight || doLeft) { this.setMiddle(Math.max(0, adjRight-adjLeft)); }
        HTML.dispatchResizeEvent();
    }

    private setRight(right: number) {
        let rightStyle = `${right}%`;
        this.renderer.setElementStyle(this.rightDiv.nativeElement, 'left', rightStyle);
        this.renderer.setElementStyle(this.rightC.nativeElement, 'left', rightStyle);
        this.lastRight = right;
    }

    private setLeft(left: number) {
        let leftStyle = `${left}%`;
        this.renderer.setElementStyle(this.leftC.nativeElement, 'width', leftStyle);
        this.renderer.setElementStyle(this.leftDiv.nativeElement,'left', leftStyle);
        this.renderer.setElementStyle(this.center.nativeElement, 'left', leftStyle);
        this.lastLeft = left;
    }

    private setMiddle(width: number) {
        this.renderer.setElementStyle(this.center.nativeElement, 'width', `${width}%`);
    }

    constructor(@Inject(Renderer) private renderer: Renderer) {}
}
