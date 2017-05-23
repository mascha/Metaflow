import {Component} from '@angular/core';
import {ViewGroup} from "../../../../common/viewmodel";
import {Diagram, Layer} from "../../../../common/layer";

/**
 * A breadcrumbs bar.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'breadcrumbs',
    styles: [require('./breadcrumbs.scss')],
    template: require('./breadcrumbs.html'),
})
export class Breadcrumbs implements Layer<Diagram> {
    
    segments: Array<any> = [];
    name = "Breadcrumbs";
    private active = true;

    initialize(diagram: Diagram) {
        diagram.scope.subscribe(it => this.updateSegments(it));
    }

    setActive(active: boolean) {
        this.active = active;
    }

    isActive(): boolean {
        return this.active;
    }

    private updateSegments(level?: ViewGroup) {
        this.segments = [];
        let i = 1;
        while (level && i < 11) {
            this.segments.push({ 
                name: level.name, 
                icon: level.style.cachedURL || null 
            });
            level = level.parent;
            i++;
        }
    }
}
