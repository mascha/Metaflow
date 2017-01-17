import {Component, Input, EventEmitter, Output} from '@angular/core';

/**
 * A pane with a title and content.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'sidebar',
    template: require('./sidebar.html'),
    styles: [require('./sidebar.scss')],
})
export class Sidebar {
    @Input() title = "TITLE";
    @Input() isPrimary: string;
    @Input() visible = true;
    
    isLoading = false;

    toggle() {
        this.visible = !this.visible;
    }
}
