import {Component} from '@angular/core';
import Sidebar from "../../sidebar/sidebar";

@Component({
    selector: 'inspector',
    template: require('./inspector.html'),
    styles: [require('./inspector.scss')],
    directives: [Sidebar]
})
export default class Inspector {
}
