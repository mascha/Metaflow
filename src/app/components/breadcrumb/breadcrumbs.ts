import {Component} from "angular2/core";
/**
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'breadcrumbs',
    styles: [require('./breadcrumb.scss')],
    template: require('./breadcrumbs.html')
})
export default class Breadcrumb {

    segments: Array<string>;

    setPath(path: string) {
        this.segments = path.split('/');
    }
    
    getFullPath(): string {
        return this.segments.join('/');
    }

    constructor(path: string) {
        this.setPath(path);
    }
}
