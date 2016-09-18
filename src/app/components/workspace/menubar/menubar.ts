import {Component, Input} from '@angular/core';

/**
 * Menu bar component.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'menu-bar',
    template: require('./menubar.html'),
    styles: [require('./menubar.scss')]
})
export default class MenuBar {
    items: Array<string> = [
        'Model','Edit', 'View', 'Simulation', 'Analysis', 'Settings', 'Help'
    ];
}