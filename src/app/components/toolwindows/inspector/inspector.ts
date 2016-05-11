import {Component, Inject} from '@angular/core';
import PaletteRegistry from "../../../services/palettes";

@Component({
    selector: 'palette',
    template: require('./inspector.html'),
    styles: [require('./inspector.scss')]
})
export default class Palette {
    categories: Array<string>;
    
    constructor(@Inject(PaletteRegistry) registry: PaletteRegistry) {
        this.categories = registry.getPalettes();
    }
}
