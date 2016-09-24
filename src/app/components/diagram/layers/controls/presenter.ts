import {Component, EventEmitter, Output} from '@angular/core';
import {WorkspaceConfig} from "../../../../services/configs";
import ConfigService from "../../../../services/configs";
import {DiagramLayer} from "../../../../common/layer";
import {ViewGroup} from "../../../../common/viewmodel";
import {Camera} from "../../../../common/camera";
/**
 * Diagramming overlay controls. 
 * 
 * @author Martin Schade    
 * @since 1.0.0
 */
@Component({
    selector: 'presenter',
    styles: [require('./presenter.scss')],
    template: require('./presenter.html'),
})
export default class Presenter implements DiagramLayer {
    private showMapControls = true;
    private showOverview = true;
    private showOmnibox = true;
    private workspace : WorkspaceConfig;
    
    update(group: ViewGroup) {

    }

    observe(camera: Camera) {

    }

    constructor(config: ConfigService) {
        this.workspace = config.getWorkspaceConfig();
    }
}
