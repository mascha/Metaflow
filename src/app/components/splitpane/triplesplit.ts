import {Component, ElementRef, ViewChild, Renderer} from "@angular/core";
import HTML from "../../common/utility";

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
    @ViewChild('leftContent') leftC: ElementRef;
    @ViewChild('leftDivider') leftDiv: ElementRef;
    @ViewChild('rightDivider') rightDiv: ElementRef;
    @ViewChild('rightContent') rightC: ElementRef;
    @ViewChild('centerContent') center: ElementRef;

    private lastLeft = 15 + 1;
    private lastRight = 85 - 1;
    private leftVisible = true;
    private rightVisible = true;
    private primaryDrag: boolean;

    private moveHandler = (event: MouseEvent) => {
        let element = this.root.nativeElement;
        let offsetX = HTML.getOffset(element, event).x;
        let relatiX = offsetX / element.offsetWidth * 100;
        this.handleAdjust(Math.round(relatiX));
        HTML.block(event);
    };

    private upHandler = (event: MouseEvent) => {
        document.removeEventListener('mousemove', this.moveHandler, true);
        document.removeEventListener('mouseup', this.upHandler, true);
        HTML.block(event);
    };

    private keyHandler = (event: KeyboardEvent) => {
        if (event.which == 27) {
            
        }
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
            this.adjustBoth(adjusted, this.lastRight);
        } else {
            this.adjustBoth(this.lastLeft, adjusted);
        }
    }

    private adjustBoth(l: number, r: number) {
        let left = (l < 0) ? 0 : (l > 100) ? 100 : l;
        let right = (r < 0) ? 0 : (r > 100) ? 100 : r;
        let adjLeft = Math.min(left, right);
        let adjRight = Math.max(left, right);
        let doLeft = Math.abs(this.lastLeft - adjLeft) > 0;
        let doRight = Math.abs(this.lastRight - adjRight) > 0;
        if (doLeft) { this.setLeft(adjLeft); }
        if (doRight) { this.setRight(adjRight); }
        if (doRight || doLeft) {
            let diff = Math.max(0, adjRight-adjLeft);
            this.setMiddle(diff);
        }
        HTML.dispatchResizeEvent();
    }

    private setRight(right: number) {
        let rightStyle = `${right}%`;
        this.render(this.rightDiv, 'left', rightStyle);
        this.render(this.rightC, 'left', rightStyle);
        this.lastRight = right;
    }

    private setLeft(left: number) {
        let leftStyle = `${left}%`;
        this.render(this.leftC, 'width', leftStyle);
        this.render(this.leftDiv,'left', leftStyle);
        this.render(this.center, 'left', leftStyle);
        this.lastLeft = left;
    }

    private setMiddle(width: number) {
        this.render(this.center, 'width', `${width}%`);
    }

    private render(e:ElementRef, p:string, s:string) {
        this.renderer.setElementStyle(e.nativeElement, p, s);
    }

    constructor(private renderer: Renderer,
                private root: ElementRef) {}
}
