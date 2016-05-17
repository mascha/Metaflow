import {Component, ViewChild} from "@angular/core";
import Diagram from "../canvas/canvas";
import Sidebar from "../sidebar/sidebar";
import DoubleSplit from "../splitpane/doublesplit";
import TripleSplit from "../splitpane/triplesplit";
import Palette from "../toolwindows/palette/palette";

/**
 * Workspace component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'workspace',
    template: require('./workspace.html'),
    styles: [require('./workspace.scss')],
    directives: [DoubleSplit, TripleSplit, Diagram, Sidebar, Palette],
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
