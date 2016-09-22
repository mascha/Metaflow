import {Component} from "@angular/core";
import ProjectService from "../../services/projects";

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
    
    constructor(private service : ProjectService) {
        service.getProjects().then(it => this.projects = it);
    }
}
