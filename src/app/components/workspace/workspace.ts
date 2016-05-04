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

    private isDragging = false;
    
    onMouseDown(event: MouseEvent) {
        this.isDragging = true;
    }
    
    onMouseMove(event: MouseEvent) {
        if (this.isDragging) 
            this.adjust(event.pageX / window.innerWidth);
    }
    
    onMouseUp(event: MouseEvent) {
        this.isDragging = false;
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
    
    private isDragging = false;

    onMouseDown(event: MouseEvent) {
        this.isDragging = true;
    }

    onMouseMoveLeft(event: MouseEvent) {
        event.preventDefault();
        if (this.isDragging) {
            let left = Math.round(event.pageX / window.innerWidth * 100);
            this.readjust(left, 80);
        }
    }
    
    onMouseMoveRight(event: MouseEvent) {
        event.preventDefault();
        if (this.isDragging) {
            let right = Math.round(event.pageX / window.innerWidth * 100);
            this.readjust(20, right);
        }
    } 

    onMouseUp(event: MouseEvent) {
        this.isDragging = false;
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
        let leftStyle = `${adjLeft}%`;
        let cenStyle = `${100 - adjLeft - adjRight}%`;
        let rightStyle = `${adjRight}%`;
        renderer.setElementStyle(this.leftContent.nativeElement, 'width', leftStyle);
        renderer.setElementStyle(this.leftDiv.nativeElement,'left', leftStyle);
        renderer.setElementStyle(this.center.nativeElement, 'left', leftStyle);
        renderer.setElementStyle(this.center.nativeElement, 'width', cenStyle);
        renderer.setElementStyle(this.rightDiv.nativeElement, 'left', rightStyle);
        renderer.setElementStyle(this.rightContent.nativeElement, 'left', rightStyle);
        renderer.setElementStyle(this.rightContent.nativeElement, 'width', `${100 - adjRight}%`)
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
