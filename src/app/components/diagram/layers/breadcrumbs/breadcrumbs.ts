import {Component, Input, Renderer} from '@angular/core';
import {ViewGroup, ViewVertex, ViewModel} from "../../../../common/viewmodel";
import {Style} from "../../../../common/styling";
import {Diagram, Layer} from "../../../../common/layer";
import ModelService from "../../../../services/models";

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
export default class Breadcrumbs implements Layer {
    private segments: Array<ViewGroup> = [];
    private model: ViewModel;
    private placeholder: ViewGroup;
    private maximumSegments = 4;
    private rootPath = "/users/${id}/${model-id}/@x@y@z1.5434"

    initialize(diagram: Diagram) {
        diagram.scope.subscribe(it => this.updateSegments(it));
    }

    setActive(active: boolean) {

    }

    isActive(): boolean {
        return true;
    }

    private updateSegments(level?: ViewGroup) {
        this.segments = [];

        while (level) {
            this.segments.push(level);
            level = level.parent;
        }
    }
}
