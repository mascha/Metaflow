import {Component, ViewChild} from "@angular/core";
import {Diagram} from "../canvas/canvas";
import Sidebar from "../sidebar/sidebar";
import DoubleSplit from "../splitpane/doublesplit";
import TripleSplit from "../splitpane/triplesplit";

/**
 * Workspace component.
 */
@Component({
    selector: 'workspace',
    template: require('./workspace.html'),
    directives: [DoubleSplit, TripleSplit, Diagram, Sidebar],
})
export default class Workspace {
    @ViewChild(TripleSplit) triple: TripleSplit;
    @ViewChild(DoubleSplit) double: DoubleSplit;
    
    togglePrimary(event: any) {
        this.triple.toggleVisibility(event, true);
    }

    toggleSecondary(event: any) {
        this.triple.toggleVisibility(event, false);
    }

    toggleTernary(event: any) {
        this.double.toggleVisibility(event);
    }
}
