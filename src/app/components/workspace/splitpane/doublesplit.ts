import {Component, ElementRef, ViewChild, Renderer, Inject, Input, HostListener} from "@angular/core";
import HTML from "../../../common/utility";

/**
 * Simple split pane.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'double-split',
    template: require('./doublesplit.html'),
    styles: [require('./splitpane.scss')],
})
export default class DoubleSplit {
    @ViewChild('left') left: ElementRef;
    @ViewChild('divider') div: ElementRef;
    @ViewChild('right') right: ElementRef;

    @Input() horizontal = false;

    private vertical = true;
    private visible = true;
    private saved: number;
    private last: number;
    private removeMove: Function;
    private removeUp: Function;
    
    private primaryPosition

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

    private upHandler = (event?: MouseEvent) => {
        this.removeMove();
        this.removeUp();
        HTML.block(event);
    };

    private ngAfterViewInit() {
        this.vertical = !this.horizontal;
        this.readjust(this.visible ? 69 : 100);
    }

    private onMouseDown(event: MouseEvent) {
        let r = this.renderer;
        this.removeMove = r.listenGlobal('document', 'mousemove', this.moveHandler);
        this.removeUp = r.listenGlobal('document', 'mouseup', this.upHandler);
    }

    private readjust(l: number) {
        let renderer = this.renderer;
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
    
    constructor(@Inject(Renderer) private renderer: Renderer,
                @Inject(ElementRef) private root: ElementRef) {}
}
