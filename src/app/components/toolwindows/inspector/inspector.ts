import {Component, ElementRef, ViewChild} from '@angular/core';
import Sidebar from "../../sidebar/sidebar";
import PropertySheet from "./propertysheet/propertysheet";

@Component({
    selector: 'inspector',
    template: require('./inspector.html'),
    styles: [require('./inspector.scss')],
    directives: [Sidebar, PropertySheet]
})
export default class Inspector {
    categoryIndex = 1;
    selection = 0;
    overlayMessage = 'No selection';

    @ViewChild('props') props: ElementRef;
    @ViewChild('styles') style: ElementRef;
    @ViewChild('notes') notes: ElementRef;

    onSelect(event: MouseEvent, index: number) {
        if (index < 1 || index > 3) {
            return;
        } else {
            this.categoryIndex = index;
        }
    }
}
