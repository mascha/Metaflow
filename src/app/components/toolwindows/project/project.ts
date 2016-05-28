import {Component} from '@angular/core';
import ModelService from "../../../services/models";
import {ViewGroup} from "../../../common/viewmodel";

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
    
    level: ViewGroup;
    isLocked = false;
    
    goUpwards() {
        let parent = this.level.parent;
        if (parent && !this.isLocked) {
            this.level = parent;
        }
    }

    constructor(private models : ModelService) {
        this.level = models.getModel();
    }
}
