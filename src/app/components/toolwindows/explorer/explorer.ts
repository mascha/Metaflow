import {Component} from '@angular/core';
import {ViewGroup} from "../../../common/viewmodel";
import ModelService from "../../../services/models";

/**
 * A project navigator/explorer.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'explorer',
    template: require('./explorer.html'),
    styles: [require('./explorer.scss')]
})
export default class Explorer {
    contents = [];
    level: ViewGroup;
    isLocked = false;
    isDisabled = false;

    goUpwards() {
        if (this.canGoUpwards()) {
            let parent = this.level.parent;
            if (parent && !this.isLocked) {
                this.updateLevel(parent);
            }
        }
    }

    private canGoUpwards() {
        return (this.level && this.level.parent);
    }

    private updateLevel(level: ViewGroup) {
        this.level = level;
        this.contents = this.level.contents;
    }

    constructor(private models : ModelService) {
        models.getModel().then((model) => this.updateLevel(model));
    }
}
