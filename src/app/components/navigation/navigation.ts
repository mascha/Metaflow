import {Component} from '@angular/core';
import {MenuBar} from "../menubar/menubar";

@Component({
    selector: 'navigation',
    styles: [require('./navigation.scss')],
    template: require('./navigation.html'),
    directives: [MenuBar]
})
export default class Headerbar {
    
}
