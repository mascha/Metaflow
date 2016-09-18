import {Component, ElementRef, ViewChild} from '@angular/core';

/**
 * Inspector tool window.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'inspector',
    template: require('./inspector.html'),
    styles: [require('./inspector.scss')]
})
export default class Inspector {
    categoryIndex = 1;
    selection = 0; // null
    overlayMessage = 'No selection';

    onSelect(index: number) {
        if (index < 1 || index > 3) {
            return;
        } else {
            this.categoryIndex = index;
        }
    }
}
