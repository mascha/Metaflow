import {Component, Input} from "angular2/core";

/**
 * A breadcrumb navigation bar.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'breadcrumbs',
    styles: [require('./breadcrumbs.scss')],
    template: require('./breadcrumbs.html')
})
export default class Breadcrumbs {

    segments: Array<string>;

    setPath(path: string) {
        this.segments = path.split('/');
    }
    
    getFullPath(): string {
        return this.segments.join('/');
    }

    constructor(path: string) {
        path = 'root/first/last';
        if (path) this.setPath(path);
        console.log(this.segments.toJSON());
    }
}
