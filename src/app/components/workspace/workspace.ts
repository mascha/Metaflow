import {Component, ViewChild} from "@angular/core";
import {WorkspaceConfig, default as ConfigService} from "../../services/configs";

import DoubleSplit from "./splitpane/doublesplit";
import TripleSplit from "./splitpane/triplesplit";

/**
 * Workspace component.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'workspace',
    template: require('./workspace.html'),
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
