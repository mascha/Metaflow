import {Component, ViewChild, Input} from "@angular/core";
import Diagram from "../canvas/canvas";
import Sidebar from "../sidebar/sidebar";
import DoubleSplit from "../splitpane/doublesplit";
import TripleSplit from "../splitpane/triplesplit";
import Palette from "../toolwindows/palette/palette";
import Dataview from "../toolwindows/data/dataview";
import ProjectExplorer from "../toolwindows/project/project";

/**
 * Workspace component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'workspace',
    template: require('./workspace.html'),
    styles: [require('./workspace.scss')],
    directives: [
        DoubleSplit, TripleSplit,
        Diagram, Sidebar,
        Palette, Dataview,
        ProjectExplorer
    ],
})
export default class Workspace {
    
    @Input() slimLayout = false;
    
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
