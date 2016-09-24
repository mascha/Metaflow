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
export default class Sidebar {
    @Input() title = "Header";
    @Input() isPrimary: string;
    @Input() showHeader = true;
    @Input() visible = true;
    @Output('visibility') private visibility = new EventEmitter<any>();

    isLoading: boolean = false;

    toggle() {
        this.visible = !this.visible;
        this.visibility.emit({
            pane: this, visible: this.visible
        });
    }
}
