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
    selection = null;
    overlayMessage = 'No selection';

    @ViewChild('props') props: ElementRef;
    @ViewChild('styles') style: ElementRef;
    @ViewChild('notes') notes: ElementRef;

    onSelect(event: MouseEvent) {
        let target = event.target;
        if (target === this.props.nativeElement) {
            this.categoryIndex = 1;
        } else if (target === this.style.nativeElement) {
            this.categoryIndex = 2;
        } else if (target === this.notes.nativeElement) {
            this.categoryIndex = 3;
        } // ignore
    }
}
