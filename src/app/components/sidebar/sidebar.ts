import {Component, Input} from '@angular/core';

@Component({
    selector: 'sidebar',
    template: require('./sidebar.html'),
    styles: [require('./sidebar.scss')]
})
export default class Sidebar {
    @Input() title: string = "Header";
}
