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

    selectedItem: any;

    items: any[] = [];

    onItemClicked(item: any) {
        this.selectedItem = item;
    }

    constructor() {
        this.selectedItem = this.items[0];
    }
} 