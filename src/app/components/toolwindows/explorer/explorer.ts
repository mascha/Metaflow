import {Component, Inject} from '@angular/core';
import {ViewGroup} from "../../../common/viewmodel";
import {Diagram} from "../../../common/layer";
import {ToolWindow} from "../toolwindow"
import {ModelService} from "../../../services/models";

/**
 * A project navigator/explorer.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'explorer',
    template: require('./explorer.html'),
    styles: [require('./explorer.scss')],
})
export class Explorer implements ToolWindow<Diagram> {
    title = "Explorer";
    contents = [];
    scope: ViewGroup;
    isLocked = false;
    isDisabled = false;
    levelName: string;

    getSize() {
        return 21;
    }

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
