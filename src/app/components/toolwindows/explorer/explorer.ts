import {Component, Inject} from '@angular/core';
import {ViewGroup} from "../../../common/viewmodel";
import {Diagram} from "../../../common/layer";
import ModelService from "../../../services/models";

/**
 * A project navigator/explorer.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'explorer',
    template: require('./explorer.html'),
    styles: [require('./explorer.scss')]
})
export default class Explorer {
    private contents = [];
    private scope: ViewGroup;
    private isLocked = false;
    private isDisabled = false;
    private levelName: string;

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

    constructor() {
         
    }
}
