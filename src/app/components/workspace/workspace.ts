import {Component, ElementRef, ViewChild, Renderer, Inject} from "@angular/core";

/**
 * Simple split pane.
 */
@Component({
    selector: 'double-split',
    template: require('./doublesplit.html'),
    styles: [require('./splitpane.scss')]
})
class DoubleSplit {
    
    @ViewChild('leftContent') left: ElementRef;
    @ViewChild('divider') divider: ElementRef;
    @ViewChild('rightContent') right: ElementRef;

    private moveHandler = (event: MouseEvent) => {
        event.preventDefault();
    };

    private upHandler = (event: MouseEvent) => {
        event.preventDefault();
        document.removeEventListener('mousemove', this.moveHandler);
        document.removeEventListener('mouseup', this.upHandler);
    };

    onMouseDown(event: MouseEvent) {
        event.preventDefault();
        document.addEventListener('mousemove', this.moveHandler);
        document.addEventListener('mouseup', this.upHandler)
    }

    /**
     *
     * @param divider
     */
    adjust(divider: number) {
        let left = (divider < 0)? 0 : (divider > 100)? 100 : divider;
        let renderer = this.renderer;
        let style = `${left}%`;
        renderer.setElementStyle(this.left, 'width', style);
        renderer.setElementStyle(this.divider, 'left', style);
        renderer.setElementStyle(this.right, 'left', style);
        renderer.setElementStyle(this.right, 'width', `${100 - left}%`);
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
class TripleSplit {

    @ViewChild('leftContent') leftContent: ElementRef;
    @ViewChild('leftDivider') leftDiv: ElementRef;
    @ViewChild('rightDivider') rightDiv: ElementRef;
    @ViewChild('rightContent') rightContent: ElementRef;
    @ViewChild('centerContent') center: ElementRef;

    private lastLeft = 20;
    private lastRight = 80;
    private left: boolean;
    
    private moveHandler = (event: MouseEvent) => {
        event.preventDefault();
        let adjusted = Math.round(event.pageX/window.innerWidth*100);
        if (this.left) {
            this.readjust(adjusted, this.lastRight);
        } else {
            this.readjust(this.lastLeft, adjusted)
        }
    };

    private upHandler = (event: MouseEvent) => {
        event.preventDefault();
        document.removeEventListener('mousemove', this.moveHandler);
        document.removeEventListener('mouseup', this.upHandler);
    };

    onMouseDown(event: MouseEvent, left: boolean) {
        this.left = left;
        event.preventDefault();
        document.addEventListener('mousemove', this.moveHandler);
        document.addEventListener('mouseup', this.upHandler)
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
        let adjCent = Math.max(0, adjRight- adjLeft);

        if (Math.abs(this.lastLeft - adjLeft) >= 1) {
            let leftStyle = `${adjLeft}%`;
            let cenStyle = `${adjCent}%`;
            renderer.setElementStyle(this.leftContent.nativeElement, 'width', leftStyle);
            renderer.setElementStyle(this.leftDiv.nativeElement,'left', leftStyle);
            renderer.setElementStyle(this.center.nativeElement, 'left', leftStyle);
            renderer.setElementStyle(this.center.nativeElement, 'width', cenStyle);
            this.lastLeft = adjLeft;
        }

        if (Math.abs(this.lastRight - adjRight) >= 1) {
            let rightStyle = `${adjRight}%`;
            renderer.setElementStyle(this.rightDiv.nativeElement, 'left', rightStyle);
            renderer.setElementStyle(this.rightContent.nativeElement, 'left', rightStyle);
            renderer.setElementStyle(this.rightContent.nativeElement, 'width', `${100 - adjRight}%`)
            this.lastRight = adjRight;
        }
    }

    constructor(@Inject(Renderer) private renderer: Renderer) {}
}

/**
 * Workspace component.
 */
@Component({
    selector: 'workspace',
    template: require('./workspace.html'),
    directives: [DoubleSplit, TripleSplit],
})
export default class Workspace {
    slim: boolean = true;
}
