import {Component} from '@angular/core';

/**
 * A project explorer.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'explorer',
    template: require('./project.html'),
    styles: [require('./project.scss')]
})
export default class ProjectExplorer {

    entities = [];
    level = "Market";
    
    goUpwards() {
        this.level = "Europe";
        this.entities = [];
        for (let i = 0; i < 11; i++) {
            this.entities.push({name: `entity${i}`, type: 'Type'})
        }
    }

    constructor() {
        for (let i = 0; i < 25; i++) {
            this.entities.push({name: 'name', type: 'Type'})
        }
    }
}
