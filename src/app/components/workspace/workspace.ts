import {Component, ViewChild} from "@angular/core";
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
    
    @ViewChild(TripleSplit) triple: TripleSplit;
    @ViewChild(DoubleSplit) double: DoubleSplit;
    
    togglePrimary(event: any) {
        console.log('workspace primary!');
    }

    toggleSecondary(event: any) {
        console.log('workspace secondary!');
    }

    toggleTernary(event: any) {
        console.log('workspace ternary!');
    }
}
