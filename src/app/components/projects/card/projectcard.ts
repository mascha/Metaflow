import {Component} from "@angular/core";

/**
 * A project card with title, date, user and
 * extra information.
 */
@Component({
    selector: 'project-card',
    template: require('./projectcard.html'),
    styles: require('./projectcard.scss')
})
export default class ProjectCard {
    title = 'TITLE';
    created : Date;
    modified: Date;
    description =  'A simple project card depicting an editable model';
    user = 'USER';
}
