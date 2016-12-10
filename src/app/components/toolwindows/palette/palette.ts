import {Component, ViewChild, ElementRef, Renderer, HostListener} from '@angular/core';
import PaletteRegistry from "../../../services/palettes";
import HTMLUtil from "../../../common/utility";
import {ToolWindow} from "../toolwindow";

/**
 * A component palette.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'palette',
    template: require('./palette.html'),
    styles: [require('./palette.scss')],
})
export default class Palette implements ToolWindow {
    title = "Palette";
    categories: Array<any>;
    components: Array<any>;
    selected: string;
    dimmed = true;
    timer: any;

    @ViewChild('icons') icons: ElementRef;
    @ViewChild('select') select: ElementRef;
    @ViewChild('overlay') overlay: ElementRef;

    private onIconsMove() {
        this.reset();
    }

    private onIconsEnter() {
        this.startTimer();
    }

    private onIconsLeave() {
        this.reset();
    }
    
    private onSelect(event: MouseEvent) {
        let index = this.eventIndex(event);
        if (this.isValidIndex(index)) {
            this.selectItem(index);
            this.reset();
        }
    }

    private onOverlayClick(event: MouseEvent) {
        let index = this.eventIndex(event);
        if (!this.isValidIndex(index)) {
            this.selectItem(index);
        }
        this.reset();
    }

    @HostListener('mouseleave') 
    private onHostLeave() {
        this.reset();
        return false;
    }
    
    private startTimer() {
        this.timer = setTimeout(() => { this.dimmed = true;}, 1200);
    }
    
    private resetTimer() {
        clearTimeout(this.timer);
        this.timer = null;
    }

    private resetDimming() {
        if (this.dimmed) { this.dimmed = false; }
    }

    private reset() {
        this.resetDimming();
        this.resetTimer();
    }

    private selectItem(index: number) {
        if (index >= 0 && index < this.categories.length) {
            let category = this.categories[index];
            this.components = category.components;
            this.selected = category.name;
            let element = this.select.nativeElement;
            if (element) {
                let value = `translateY(${index * 32}px)`;
                this.renderer.setElementStyle(
                    element, 'transform', value
                );
            }
        }
    }

    private isValidIndex(index: number) {
        return (index >= 0 && this.categories && index < this.categories.length);
    }

    private eventIndex(event: MouseEvent): number {
        let ele = this.icons.nativeElement;
        let off = HTMLUtil.getOffset(ele, event);
        return this.getIndex(off.y);
    }

    private getIndex(y: number) {
        return Math.floor(y / 32);
    }
    
    constructor(private registry: PaletteRegistry,
                private renderer: Renderer) {
        this.categories = registry.getCategories();
        this.components = this.categories[0].components;
    }
}
