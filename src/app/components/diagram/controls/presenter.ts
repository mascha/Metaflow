import {Component, EventEmitter, Output} from '@angular/core';
import {WorkspaceConfig} from "../../../services/configs";
import ConfigService from "../../../services/configs";
import Breadcrumbs from '../breadcrumbs/breadcrumbs';

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
    directives: [Breadcrumbs]
})
export default class Presenter {

    showMapControls = true;
    showOverview = true;
    showOmnibox = true;

    @Output('fitView') private fitview = new EventEmitter<string>();
    @Output('zoomIn') private zoomout = new EventEmitter<string>();
    @Output('zoomOut') private zoomin = new EventEmitter<string>();

    private onFitView() {
        this.fitview.emit('fitView');
    }

    private onZoomOut() {
        this.zoomout.emit('zoomOut');
    }

    private onZoomIn() {
        this.zoomin.emit('zoomIn');
    }

    private workspace : WorkspaceConfig;

    constructor(config: ConfigService) {
        this.workspace = config.getWorkspaceConfig();
    }
}
