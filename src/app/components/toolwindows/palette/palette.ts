import {Component, ViewChild, ElementRef, Renderer, HostListener} from '@angular/core';
import PaletteRegistry from "../../../services/palettes";
import HTMLUtil from "../../../common/utility";

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
export default class Palette {
    private categories: Array<any>;
    private components: Array<any>;
    private selected: string;
    private dimmed = false;
    private timer: any;

    @ViewChild('icons') icons: ElementRef;
    @ViewChild('select') select: ElementRef;
    @ViewChild('overlay') overlay: ElementRef;

    onIconsMove() {
        this.reset();
    }

    onIconsEnter() {
        this.startTimer();
    }

    onIconsLeave() {
        this.reset();
    }
    
    onSelect(event: MouseEvent) {
        let index = this.eventIndex(event);
        if (this.isValidIndex(index)) {
            this.selectItem(index);
            this.reset();
        }
    }

    onOverlayClick(event: MouseEvent) {
        let index = this.eventIndex(event);
        if (!this.isValidIndex(index)) {
            this.selectItem(index);
        }
        this.reset();
    }

    @HostListener('mouseleave') 
    onHostLeave() {
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
        if (!this.categories) { return false; }
        return (index >= 0 && index < this.categories.length);
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
