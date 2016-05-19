import {Component, ViewChild, ElementRef, Renderer, HostListener} from '@angular/core';
import PaletteRegistry from "../../../services/palettes";
import HTML from "../../../common/HTML";

/**
 * A component palette.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'palette',
    template: require('./palette.html'),
    styles: [require('./palette.scss')]
})
export default class Palette {
    categories: Array<any>;
    components: any;
    selected: string;
    dimmed = false;

    private timer: any;

    @ViewChild('icons') icons: ElementRef;
    @ViewChild('select') select: ElementRef;
    @ViewChild('overlay') overlay: ElementRef;

    onSelect(event) {
        let ele = this.icons.nativeElement;
        let off = HTML.getOffset(ele, event);
        let index = this.getIndex(off.y);
        if (this.isValidIndex(index)) {
            this.selectItem(index);
            clearTimeout(this.timer);
            this.dimmed = false;
        }
    }

    onOverlayClick(event) {
        let ele = this.overlay.nativeElement;
        let off = HTML.getOffset(ele, event);
        let index = this.getIndex(off.y);
        if (!this.isValidIndex(index)) {
            this.selectItem(index);
        }
        this.dimmed = false;
    }

    onEnter() {
        this.timer = setTimeout(() => {
            this.dimmed = true;
        }, 666);
    }

    onLeave() {
        if (!this.dimmed) {
            clearTimeout(this.timer)
        }
    }

    @HostListener('mouseleave')
    onHostLeave() {
        clearTimeout(this.timer);
        if (this.dimmed) {
            this.dimmed = false;
        }
        return false;
    }

    private selectItem(index: number) {
        let category = this.categories[index];
        this.components = category.components;
        this.selected = category.name;
        let e = this.select.nativeElement;
        if (e) {
            let value = `translateY(${index * 32}px)`;
            this.renderer.setElementStyle(
                e, 'transform', value
            );
        }
    }

    private isValidIndex(index: number) {
        if (!this.categories) { return false; }
        return (index >= 0 && index < this.categories.length)
    }

    private getIndex(y: number) {
        return Math.floor(y / 32);
    }
    
    constructor(private registry: PaletteRegistry,
                private renderer: Renderer) {
        this.categories = registry.getCategories();
    }
}
