import {Component, ViewChild, ElementRef, Renderer} from '@angular/core';
import PaletteRegistry from "../../../services/palettes";
import HTML from "../../../common/HTML";

/**
 * A component palette.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'explorer',
    template: require('./project.html'),
    styles: [require('./project.scss')]
})
export default class ProjectExplorer {
    categories: Array<any>;
    components: any;
    dimmed = false;

    @ViewChild('icons') icons: ElementRef;
    @ViewChild('select') select: ElementRef;

    onIconSelect(event) {
        let off = HTML.getOffset(this.icons.nativeElement, event);
        let index = Math.floor(off.y / 32);
        if (index >= 0 && index < this.categories.length && this.select.nativeElement) {
            this.renderer.setElementStyle(
                this.select.nativeElement, 'transform', `translateY(${index * 32}px)`
            );
            this.components = this.categories[index].components;
        }
    }
    
    onEnter() {
        console.log('entered!')
    }
    
    onLeave() {
        console.log('leaved!')
    }
    
    constructor(private registry: PaletteRegistry,
                private renderer: Renderer) {
        this.categories = registry.getCategories();
    }
}
