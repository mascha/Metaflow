import {Component} from "@angular/core";
import {DoubleSplit, TripleSplit} from "../splitpane/splitpane";
import {Diagram} from "../canvas/canvas";
import Sidebar from "../sidebar/sidebar";

/**
 * Workspace component.
 */
@Component({
    selector: 'workspace',
    template: require('./workspace.html'),
    directives: [DoubleSplit, TripleSplit, Diagram, Sidebar],
})
export default class Workspace {
    slim: boolean = true;
}
