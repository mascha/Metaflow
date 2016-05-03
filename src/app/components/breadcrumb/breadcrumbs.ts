import {Component} from 'angular2/core';
import {NgFor} from 'angular2/common';
import {ViewGroup} from "../canvas/viewmodel";

/**
 * A breadcrumb navigation bar.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'breadcrumbs',
    styles: [require('./breadcrumbs.scss')],
    template: require('./breadcrumbs.html'),
    directives: [NgFor]
})
export default class Breadcrumbs {

    segments: Array<ViewGroup>;

    setPath(group: ViewGroup) {
        this.segments = [];
        while (group) {
            this.segments.push(group);
            group = group.parent;
        }
    }

    constructor() {
        let root = new ViewGroup('root', 0,0,0,0,0);
        let first = new ViewGroup('first', 0,0,0,0,0);
        let sec = new ViewGroup('second', 0,0,0,0,0);
        root.addContent(first);
        first.addContent(sec);
        this.setPath(sec)
    }
}
