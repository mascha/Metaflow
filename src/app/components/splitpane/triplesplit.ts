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
    @ViewChild('leftContent') leftContent: ElementRef;
    @ViewChild('leftDivider') leftDiv: ElementRef;
    @ViewChild('rightDivider') rightDiv: ElementRef;
    @ViewChild('rightContent') rightContent: ElementRef;
    @ViewChild('centerContent') center: ElementRef;

    private static BASE = 15;
    private static MAX = 100;

    private lastLeft = TripleSplit.BASE + 1;
    private lastRight = TripleSplit.BASE - 1;
    private leftVisible = true;
    private rightVisible = true;
    private primaryDrag: boolean;

    private moveHandler = (event: MouseEvent) => {
        let element = this.root.nativeElement;
        let offsetX = HTML.getOffset(element, event).x;
        let relatiX = offsetX / element.offsetWidth * TripleSplit.MAX;
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
        this.adjustBoth(
            TripleSplit.BASE,
            TripleSplit.MAX - TripleSplit.BASE
        );
    }

    onMouseDown(event: MouseEvent, primaryDrag: boolean) {
        document.addEventListener('mousemove', this.moveHandler, true);
        document.addEventListener('mouseup', this.upHandler, true);
        this.primaryDrag = primaryDrag;
        HTML.block(event);
    }

    toggleVisibility(event: any, primary: boolean) {
        if (primary) {
            this.leftVisible = !this.leftVisible;
        } else {
            this.rightVisible = !this.rightVisible;
        }
    }

    private handleAdjust(adjusted: number) {
        if (this.primaryDrag) {
            this.adjustBoth(adjusted, this.lastRight);
        } else {
            this.adjustBoth(this.lastLeft, adjusted)
        }
    }

    private adjustBoth(l: number, r: number) {
        const renderer = this.renderer;
        let left = (l < 0)? 0 : (l > 100) ? 100 : l;
        let right = (r < 0)? 0 : (r > 100) ? 100 : r;
        let adjLeft = Math.min(left, right);
        let adjRight = Math.max(left, right);

        let doLeft = Math.abs(this.lastLeft - adjLeft) > 0;
        let doRight = Math.abs(this.lastRight - adjRight) > 0;

        if (doLeft) {
            let leftStyle = `${adjLeft}%`;
            renderer.setElementStyle(this.leftContent.nativeElement, 'width', leftStyle);
            renderer.setElementStyle(this.leftDiv.nativeElement,'left', leftStyle);
            renderer.setElementStyle(this.center.nativeElement, 'left', leftStyle);
            this.lastLeft = adjLeft;
        }

        if (doRight) {
            let rightStyle = `${adjRight}%`;
            renderer.setElementStyle(this.rightDiv.nativeElement, 'left', rightStyle);
            renderer.setElementStyle(this.rightContent.nativeElement, 'left', rightStyle);
            this.lastRight = adjRight;
        }

        if (doRight || doLeft) {
            let adjCent = Math.max(0, adjRight-adjLeft);
            let cenStyle = `${adjCent}%`;
            renderer.setElementStyle(this.center.nativeElement, 'width', cenStyle);
            HTML.dispatchResizeEvent();
        }
    }

    private adjustLeft(l: number) {
        const renderer = this.renderer;
        let left = (l < 0)? 0 : (l > 100) ? 100 : l;
        let leftStyle = `${left}%`;
        renderer.setElementStyle(this.leftContent.nativeElement, 'width', leftStyle);
        renderer.setElementStyle(this.leftDiv.nativeElement,'left', leftStyle);
        renderer.setElementStyle(this.center.nativeElement, 'left', leftStyle);
        renderer.setElementStyle(this.center.nativeElement, 'width', `${100-left}%`);
        this.lastLeft = left;
    }

    private adjustRight(r: number) {
        const renderer = this.renderer;
        let right = (r < 0)? 0 : (r > 100) ? 100 : r;
        let rightStyle = `${right}%`;
        renderer.setElementStyle(this.rightDiv.nativeElement, 'left', rightStyle);
        renderer.setElementStyle(this.rightContent.nativeElement, 'left', rightStyle);
        renderer.setElementStyle(this.center.nativeElement, 'left', `0%`);
        renderer.setElementStyle(this.center.nativeElement, 'width', rightStyle);
        this.lastRight = right;
    }

    constructor(@Inject(Renderer) private renderer: Renderer) {}
}
