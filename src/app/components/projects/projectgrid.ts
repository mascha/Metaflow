import {Component} from "@angular/core";
import ProjectService from "../../services/projects";

/**
 * A project dashboard. 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: '',
    template: require('./projectgrid.html'),
    styles: [require('./projectgrid.scss')]
})
export default class ProjectPage {

    private projects: Array<string>;
    
    constructor(private service : ProjectService) {
        this.projects = service.getProjects();
    }
}
