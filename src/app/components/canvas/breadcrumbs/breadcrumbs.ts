import {Component} from '@angular/core';
import {ViewGroup} from "../../../common/viewmodel";

/**
 * A breadcrumbs breadcrumbs bar.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'breadcrumbs',
    styles: [require('./breadcrumbs.scss')],
    template: require('./breadcrumbs.html'),
})
export default class Breadcrumbs {

    segments: Array<ViewGroup>;

    setPath(group: ViewGroup) {
        this.segments = [];
        while (group) {
            this.segments.push(group);
            group = group.parent;
        }
        this.segments.reverse();
    }

    constructor() {
        this.segments = [new ViewGroup('Model',0,0,0,0,0)];
    }
}
