import {Component, ViewChild, Input} from "@angular/core";
import Diagram from "../canvas/canvas";
import Sidebar from "../sidebar/sidebar";
import DoubleSplit from "../splitpane/doublesplit";
import TripleSplit from "../splitpane/triplesplit";
import Palette from "../toolwindows/palette/palette";
import Dataview from "../toolwindows/data/dataview";
import Explorer from "../toolwindows/project/project";
import {WorkspaceConfig, default as ConfigService} from "../../services/configs";
import Inspector from "../toolwindows/inspector/inspector";

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
        Inspector, Palette, Dataview, Explorer
    ],
})
export default class Workspace {
    
    workspace: WorkspaceConfig;
    
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
    
    constructor(private config: ConfigService) {
        this.workspace = config.getWorkspaceConfig();
    }
}
