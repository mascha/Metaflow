import {Component, EventEmitter} from '@angular/core';
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

    private events = new EventEmitter<string>();

    onFitView() {
        this.events.emit('fitView');
    }

    onZoomOut() {
        this.events.emit('zoomOut');
    }

    onZoomIn() {
        this.events.emit('zoomIn');
    }

    private workspace : WorkspaceConfig;

    constructor(config: ConfigService) {
        this.workspace = config.getWorkspaceConfig();
    }
}
