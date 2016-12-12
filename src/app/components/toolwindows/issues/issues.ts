import {Component, Inject} from '@angular/core';
import {ViewGroup} from "../../../common/viewmodel";
import {Diagram} from "../../../common/layer";
import {ToolWindow} from "../toolwindow"
import ModelService from "../../../services/models";

/**
 * A problem viewer.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'issues',
    template: require('./issues.html'),
    styles: [require('./issues.scss')]
})
export class Issues implements ToolWindow {
    title = "Issues";
    contents = [];
    scope: ViewGroup;
    isLocked = false;
    isDisabled = false;
    levelName: string;

    initialize(diagram: Diagram) {
        diagram.scope.subscribe(it => this.updateLevel(it));
    }

    private goUpwards() {
        if (this.canGoUpwards()) {
            let parent = this.scope.parent;
            if (parent && !this.isLocked) {
                this.updateLevel(parent);
            }
        }
    }

    private canGoUpwards() {
        return (this.scope && this.scope.parent);
    }

    private updateLevel(level: ViewGroup) {
        this.scope = level;
        this.levelName = level? level.name : '';
        this.contents = level? level.contents : [];
    }
}
