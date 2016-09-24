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
    
    private workspace: WorkspaceConfig;
    
    constructor(private config: ConfigService) {
        this.workspace = config.getWorkspaceConfig();
    }
}
