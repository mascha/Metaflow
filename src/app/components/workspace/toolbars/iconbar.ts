import { Component, Input } from '@angular/core';

/**
 * 
 */
@Component({
    selector: 'iconbar',
    template: require('./iconbar.html'),
    styles: [require('./iconbar.scss')]
})
export class Iconbar {
    @Input() vertical = true;
    @Input() position = "left";

    items = [
        { label: 'Project' },
        { label: 'Issues' },
        { label: 'Inspector' } 
    ]
}