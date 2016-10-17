import {Component, EventEmitter, Output} from '@angular/core';
import {WorkspaceConfig} from "../../../../services/configs";
import ConfigService from "../../../../services/configs";
import {Layer, Diagram} from "../../../../common/layer";
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
export default class Presenter implements Layer {
    private showControls = true;
    private workspace : WorkspaceConfig;
    
    initialize(diagram: Diagram) {
        diagram.model.subscribe(it => {
            this.showControls = (it && it.root) ? true : false;
        });
    }

    private onZoomIn(event: MouseEvent) {
        
    }

    private onZoomOut(event: MouseEvent) {

    }

    private onFitIn(event: MouseEvent) {

    }

    constructor(config: ConfigService) {
        this.workspace = config.getWorkspaceConfig();
    }
}
