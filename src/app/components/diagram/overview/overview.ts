import {Component, ElementRef, ViewChild} from '@angular/core'

@Component({
    selector: 'overview',
    template: '<canvas #surface></canvas>',
    styles: [require('./overview.scss')]
})
export default class Overview {
    @ViewChild('surface') canvas: ElementRef;
    
    ngAfterViewInit() {
        
    }
}
