import {Component, ViewChild, Input} from "@angular/core";
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
    @Input() slim: boolean = true;
    
    @ViewChild(TripleSplit) triple: TripleSplit;
    @ViewChild(DoubleSplit) double: DoubleSplit;
    
    togglePrimary(event: any) {
        this.triple.togglePrimary(event);
    }

    toggleSecondary(event: any) {
        this.triple.toggleSecondary(event);
    }

    toggleTernary(event: any) {
        this.double.toggleVisibility(event);
    }
}
