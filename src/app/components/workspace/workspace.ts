import {Component, ViewChild} from "@angular/core";
import {WorkspaceConfig, default as ConfigService} from "../../services/configs";
import Diagram from "../diagram/diagram";
import Sidebar from "../sidebar/sidebar";
import DoubleSplit from "../splitpane/doublesplit";
import TripleSplit from "../splitpane/triplesplit";
import Palette from "../toolwindows/palette/palette";
import Dataview from "../toolwindows/data/dataview";
import Inspector from "../toolwindows/inspector/inspector";
import Explorer from "../toolwindows/explorer/explorer";

/**
 * Workspace component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'workspace',
    template: require('./workspace.html'),
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
