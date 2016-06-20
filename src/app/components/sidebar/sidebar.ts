import {Component, Input, EventEmitter, Output} from '@angular/core';

/**
 * A pane with a title and content.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'sidebar',
    template: require('./sidebar.html'),
    styles: [require('./sidebar.scss')],
})
export default class Sidebar {
    @Input() title: string = "Header";
    @Input() side: string;
    @Input() titleVisible: boolean = true;
    @Input() visible: boolean = true;

    @Output('visibility') visibility: EventEmitter<any>;

    isLoading: boolean = false;

    toggle() {
        this.visible = !this.visible;
        this.visibility.emit({
            pane: this, visible: this.visible
        });
    }

    constructor() {
        this.visibility = new EventEmitter();
        this.isLoading = Math.random() < 1;
        if (this.isLoading) {
            setTimeout(() => {
                this.isLoading = false;
            }, (Math.random() + 0.5) * 2500);
        }
    }
}
