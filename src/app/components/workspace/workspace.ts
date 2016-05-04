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
    
    private centerMin = 20;
    private isDragging = false;

    onMouseDown(event: MouseEvent) {
        this.isDragging = true;
    }

    onMouseMoveLeft(event: MouseEvent) {
        if (this.isDragging) {
            this.readjust(20, event.pageX / window.innerWidth);
        }
    }
    
    onMouseMoveRight(event: MouseEvent) {
        if (this.isDragging) {
            this.readjust(event.pageX / window.innerWidth, 80);
        }
    } 

    onMouseUp(event: MouseEvent) {
        this.isDragging = false;
    }

    /**
     *
     * @param left
     * @param right
     */
    readjust(left: number, right: number) {
        const renderer = this.renderer;
        left = (left < 0)? 0 : (left > 100) ? 100 : left;
        right = (right < 0)? 0 : (right > 100) ? 100 : right;
        let adjLeft = Math.min(left, right - this.centerMin);
        let adjRight = Math.max(left + this.centerMin, right);
        let leftStyle = `${adjLeft}%`;
        let cenStyle = `${100 - adjLeft - adjRight}%`;
        let rightStyle = `${adjRight}%`;
        renderer.setElementStyle(this.leftContent, 'width', leftStyle);
        renderer.setElementStyle(this.leftDiv,'left', leftStyle);
        renderer.setElementStyle(this.center, 'left', leftStyle);
        renderer.setElementStyle(this.center, 'width', cenStyle);
        renderer.setElementStyle(this.rightDiv, 'left', rightStyle);
        renderer.setElementStyle(this.rightContent, 'left', rightStyle);
        renderer.setElementStyle(this.rightContent, 'width', `${100 - adjRight}%`)
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
