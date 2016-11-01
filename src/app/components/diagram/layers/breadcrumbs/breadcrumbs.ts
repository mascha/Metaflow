import {Component, Input} from '@angular/core';
import {ViewGroup, ViewVertex, Model} from "../../../../common/viewmodel";
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
    private model: Model;
    private placeholder: ViewGroup;
    private maximumSegments = 4;
    private rootPath = "/users/${id}/${model-id}/@x@y@z1.5434"

    public initialize(diagram: Diagram) {
        diagram.scope.subscribe(it => this.updateSegments(it));
    }

    private updateSegments(level?: ViewGroup) {
        this.segments = [];

        while (level) {
            this.segments.push(level);
            level = level.parent;
        }
    }
}
