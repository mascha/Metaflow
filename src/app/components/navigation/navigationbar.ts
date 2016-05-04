import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {ViewGroup} from "../../common/viewmodel";

/**
 * A navigation navigation bar.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'navigation-bar',
    styles: [require('./navigationbar.scss')],
    template: require('./navigationbar.html'),
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
        this.segments.reverse();
    }
}
