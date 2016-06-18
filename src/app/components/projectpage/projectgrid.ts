import {Component} from "@angular/core";
import ProjectService from "../../services/projects";

/**
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: '',
    template: require('./projectgrid.html'),
    styles: [require('./projectgrid.scss')]
})
export default class ProjectPage {
    
    constructor(private projects : ProjectService) {}
}
