import {Component} from '@angular/core';
import {WorkspaceConfig} from "../../../services/configs";
import ConfigService from "../../../services/configs";

/**
 * Diagramming overlay tools. 
 * 
 * @author Martin Schade    
 * @since 1.0.0
 */
@Component({
    selector: 'presenter',
    styles: [require('./presenter.scss')],
    template: require('./presenter.html')
})
export default class Presenter {

    showMapControls = true;
    showOverview = true;
    showOmnibox = true;

    private workspace : WorkspaceConfig;

    constructor(config: ConfigService) {
        this.workspace = config.getWorkspaceConfig();
    }
}
