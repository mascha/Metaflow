import {Component, Inject} from '@angular/core';
import PaletteRegistry from "../../../services/palettes";

@Component({
    selector: 'palette',
    template: require('./palette.html'),
    styles: [require('./palette.scss')]
})
export default class Palette {
    categories: Array<string>;

    components = [
        'Source',
        'Sink',
        'Buffer',
        'Queue',
        'Processor',
        'Delay',
        'Conveyor',
        'Decision',
        'Split',
        'Join',
        'Merge',
        'Resource',
        'Hold',
        'Limiter',
        'Release',
        'Metric',
        'Measure'
    ];
    
    onEnter() {
        console.log('entered!')
    }
    
    onLeave() {
        console.log('leaved!')
    }
    
    constructor(@Inject(PaletteRegistry) registry: PaletteRegistry) {
        this.categories = registry.getCategories();
    }
}
