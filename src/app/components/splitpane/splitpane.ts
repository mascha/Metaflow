import {Component, ElementRef, ViewChild, Renderer, Inject} from "@angular/core";
import HTML from "../../common/html";

/**
 * Simple split pane.
 */
@Component({
    selector: 'double-split',
    template: require('./doublesplit.html'),
    styles: [require('./splitpane.scss')]
})
export class DoubleSplit {

    @ViewChild('leftContent') leftContent: ElementRef;
    @ViewChild('divider') left: ElementRef;
    @ViewChild('rightContent') rightContent: ElementRef;
    
    private lastLeft = 50;

    private moveHandler = (event: MouseEvent) => {
        HTML.block(event);
        let adjusted = Math.round(event.pageX/window.innerWidth*100);
        this.readjust(adjusted);
    };

    private upHandler = (event: MouseEvent) => {
        HTML.block(event);
        document.removeEventListener('mousemove', this.moveHandler, true);
        document.removeEventListener('mouseup', this.upHandler, true);
    };

    onMouseDown(event: MouseEvent) {
        HTML.block(event);
        document.addEventListener('mousemove', this.moveHandler, true);
        document.addEventListener('mouseup', this.upHandler, true);
    }

    /**
     *
     * @param l
     * @param r
     */
    readjust(l: number) {
        const renderer = this.renderer;
        let left = (l < 0)? 0 : (l > 100) ? 100 : l;
        let adjLeft = Math.min(left, 100);
        let doLeft = Math.abs(this.lastLeft - adjLeft) > 0;

        if (doLeft) {
            let leftStyle = `${adjLeft}%`;
            renderer.setElementStyle(this.leftContent.nativeElement, 'width', leftStyle);
            renderer.setElementStyle(this.left.nativeElement,'left', leftStyle);
            renderer.setElementStyle(this.rightContent.nativeElement, 'left', leftStyle);
            this.lastLeft = adjLeft;
        }
    }
    
    constructor(@Inject(Renderer) private renderer: Renderer) {}
}

/**
 * Three column split pane.
 */
@Component({
    selector: 'triple-split',
    template: require('./triplesplit.html'),
    styles: [require('./splitpane.scss')]
})
export class TripleSplit {

    @ViewChild('leftContent') leftContent: ElementRef;
    @ViewChild('leftDivider') leftDiv: ElementRef;
    @ViewChild('rightDivider') rightDiv: ElementRef;
    @ViewChild('rightContent') rightContent: ElementRef;
    @ViewChild('centerContent') center: ElementRef;

    private lastLeft = 20;
    private lastRight = 80;
    private left: boolean;

    private moveHandler = (event: MouseEvent) => {
        HTML.block(event);
        let adjusted = Math.round(event.pageX/window.innerWidth*100);
        if (this.left) {
            this.readjust(adjusted, this.lastRight);
        } else {
            this.readjust(this.lastLeft, adjusted)
        }
    };

    private upHandler = (event: MouseEvent) => {
        HTML.block(event);
        document.removeEventListener('mousemove', this.moveHandler, true);
        document.removeEventListener('mouseup', this.upHandler, true);
    };

    onMouseDown(event: MouseEvent, left: boolean) {
        this.left = left;
        HTML.block(event);
        document.addEventListener('mousemove', this.moveHandler, true);
        document.addEventListener('mouseup', this.upHandler, true);
    }

    /**
     *
     * @param l
     * @param r
     */
    readjust(l: number, r: number) {
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

    constructor(@Inject(Renderer) private renderer: Renderer) {}
}
