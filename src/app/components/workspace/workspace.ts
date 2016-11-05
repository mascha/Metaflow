import {Component, ViewChild, Inject} from "@angular/core";
import {Diagram} from '../../common/layer';

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
    private slimLayout = true;

    @Inject('diagram') diagram: Diagram;
}
