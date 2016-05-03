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
    segments: Array<string> = ['root', 'first', 'third']
}
