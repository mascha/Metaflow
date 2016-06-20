import {Component, Host} from '@angular/core';
import {ViewGroup} from "../../../common/viewmodel";
import ModelService from "../../../services/models";

/**
 * A project navigator/explorer.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'explorer',
    template: require('./project.html'),
    styles: [require('./project.scss')]
})
export default class ProjectExplorer {
    contents = [];
    level: ViewGroup;
    isLocked = false;
    isDisabled = false;

    goUpwards() {
        if (this.canGoUpwards()) {
            let parent = this.level.parent;
            if (parent && !this.isLocked) {
                this.updateLevel(parent);
                this.updateDisabled();
            }
        }
    }

    private canGoUpwards() {
        return (this.level && this.level.parent);
    }

    private updateDisabled() {
        this.isDisabled = !this.canGoUpwards();
    }

    private updateLevel(level: ViewGroup) {
        this.level = level;
        this.contents = this.level.contents;
    }

    constructor(private models : ModelService) {
        this.updateLevel(models.getModel());
        this.updateDisabled();
    }
}
