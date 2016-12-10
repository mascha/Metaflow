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
    @Input() vertical: boolean;
    @Input() primary: boolean;

    items = [
        { label: 'Project' },
        { label: 'Issues' },
        { label: 'Inspector' } 
    ]
}

/**
 * Icon item with selection status.
 */
class IconItem {
    @Input() label: string = "NONE";
    @Input() icon: string = "";

    selected = false;
}