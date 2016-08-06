import {Component, Input} from '@angular/core';

@Component({
    selector: 'menu-bar',
    template: require('./menubar.html'),
    styles: [require('./menubar.scss')]
})
export class MenuBar {
    items: Array<string> = [
        'Model','Edit', 'View', 'Simulation', 'Analysis', 'Settings', 'Help'
    ];
}