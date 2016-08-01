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

    private segments: Array<ViewGroup>;

    setPath(group: ViewGroup) {
        let segments = [];

        while (group) {
            segments.push(group);
            group = group.parent;
        }
        
        this.segments = segments.reverse();
    }

    constructor() {
        let child0 = new ViewGroup('Level #0',0,0,0,0,0);
        let child1 = new ViewGroup('Level #1',0,0,0,0,0);
        let child2 = new ViewGroup('Level #2',0,0,0,0,0);
        child0.addContent(child1);
        child1.addContent(child2);
        this.setPath(child2);
    }
}
