import {Component, Input, EventEmitter, Output} from '@angular/core';

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
    
    toggle() {
        this.visible = !this.visible;
        this.visibility.emit({
            pane: this,
            visible: this.visible
        });

        setTimeout(() => {
            this.visible = !this.visible;
            this.visibility.emit({
                pane: this,
                visible: this.visible
            });
        }, 2000)
    }

    constructor() {
        this.visibility = new EventEmitter();
    }
}
