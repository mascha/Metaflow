import {Component, ViewChild} from "@angular/core";

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
}
