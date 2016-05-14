import {Component, ElementRef, ViewChild, Renderer, Inject, Input} from "@angular/core";
import HTML from "../../common/html";
import Sidebar from "../sidebar/sidebar";

/**
 * Simple split pane.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'double-split',
    template: require('./doublesplit.html'),
    styles: [require('./splitpane.scss')],
    directives: [Sidebar]
})
export class DoubleSplit {
    
    @ViewChild('root') root: ElementRef;
    @ViewChild('left') left: ElementRef;
    @ViewChild('divider') div: ElementRef;
    @ViewChild('right') right: ElementRef;
    @Input() orientation: string;
    
    private vertical = true;
    private visible = true;
    private last: number;

    private moveHandler = (event: MouseEvent) => {
        let elem = this.root.nativeElement;
        let offs = HTML.getOffset(elem, event);
        let page = this.vertical ? offs.x : offs.y;
        let upper = this.vertical ? elem.offsetWidth : elem.offsetHeight;
        if (!upper) return;
        page = ((page < 0)? 0 : ((page > upper) ? upper : page));
        let adjusted = Math.round(page/upper * 99);
        this.readjust(adjusted);
        HTML.block(event);
    };

    private upHandler = (event: MouseEvent) => {
        HTML.block(event);
        document.removeEventListener('mousemove', this.moveHandler, true);
        document.removeEventListener('mouseup', this.upHandler, true);
    };

    ngAfterViewInit() {
        this.vertical = (this.orientation !== 'horizontal');
        this.readjust(this.visible ? 69 : 100);
    }

    toggleVisibility(event: any) {
        document.removeEventListener('mousemove', this.moveHandler, true);
        document.removeEventListener('mouseup', this.upHandler, true);
        this.visible = !this.visible;
        this.readjust(100);
    }

    onMouseDown(event: MouseEvent) {
        document.addEventListener('mousemove', this.moveHandler, true);
        document.addEventListener('mouseup', this.upHandler, true);
    }

    /**
     * Readjust splitpane positions.
     * @param l
     */
    private readjust(l: number) {
        const renderer = this.renderer;
        let left = (l < 0) ? 0 : (l > 100) ? 100 : l;
        let doLeft = Math.abs(this.last - left) > 0;

        if (doLeft || !this.last) {
            let position = this.vertical? 'left' : 'top';
            let expanse = this.vertical? 'width' : 'height';
            let pos = `${left}%`;

            renderer.setElementStyle(this.left.nativeElement, expanse, pos);
            if (this.visible) {
                renderer.setElementStyle(this.div.nativeElement, position, pos);
                renderer.setElementStyle(this.right.nativeElement, position, pos);
            }
            this.last = left;
            HTML.dispatchResizeEvent();
        }
    }
    
    constructor(@Inject(Renderer) private renderer: Renderer) {}
}

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
export class TripleSplit {

    private static BASE = 15;
    private static MAX = 100;

    @ViewChild('root') root: ElementRef;
    @ViewChild('leftContent') leftContent: ElementRef;
    @ViewChild('leftDivider') leftDiv: ElementRef;
    @ViewChild('rightDivider') rightDiv: ElementRef;
    @ViewChild('rightContent') rightContent: ElementRef;
    @ViewChild('centerContent') center: ElementRef;

    @Input('vertical') vertical: boolean;
    
    private lastLeft = TripleSplit.BASE + 1;
    private lastRight = TripleSplit.BASE - 1;
    private left: boolean;

    private moveHandler = (event: MouseEvent) => {
        let element = this.root.nativeElement;
        let offsetX = HTML.getOffset(element, event).x;
        let relatiX = offsetX / element.offsetWidth * TripleSplit.MAX;
        let adjusted = Math.round(relatiX);
        if (this.left) {
            this.readjust(adjusted, this.lastRight);
        } else {
            this.readjust(this.lastLeft, adjusted)
        }
        HTML.block(event);
    };

    private upHandler = (event: MouseEvent) => {
        HTML.block(event);
        document.removeEventListener('mousemove', this.moveHandler, true);
        document.removeEventListener('mouseup', this.upHandler, true);
    };
    
    ngAfterViewInit() {
        this.readjust(TripleSplit.BASE, TripleSplit.MAX-TripleSplit.BASE);
    }

    onMouseDown(event: MouseEvent, left: boolean) {
        this.left = left;
        document.addEventListener('mousemove', this.moveHandler, true);
        document.addEventListener('mouseup', this.upHandler, true);
    }

    togglePrimary(event: any) {

    }

    toggleSecondary(event: any) {

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
