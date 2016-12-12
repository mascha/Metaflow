import { Component, Input, AfterViewInit } from '@angular/core';

/**
 * 
 */
@Component({
    selector: 'iconbar',
    template: require('./iconbar.html'),
    styles: [require('./iconbar.scss')]
})
export class Iconbar implements AfterViewInit {
    @Input() vertical: boolean;
    @Input() primary: boolean;

    selectedItem: any;

    items: any[] = [{title:""}];

    onItemClicked(item: any) {
        this.selectedItem = item;
    }

    ngAfterViewInit() {
        
    }

    constructor() {
        this.selectedItem = this.items[0];
    }
} 