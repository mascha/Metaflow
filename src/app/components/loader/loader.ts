import { Component, Input } from '@angular/core';

@Component({
    selector: 'loader',
    template: require('./loader.html'),
    styles: [require('./loader.scss')]
})
export default class Loader {
    @Input() indefinite = false;
    @Input() progress = 0.0
    @Input() message = "Loading" 
}