import {Component} from "@angular/core";

/**
 * A project dashboard.
 *  
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'project-grid',
    template: require('./projectgrid.html'),
    styles: [require('./projectgrid.scss')]
})
export default class ProjectPage {

    private projects: Array<string>;
}
