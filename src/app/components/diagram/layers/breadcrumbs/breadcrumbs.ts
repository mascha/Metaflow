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
    private segments: Array<String>;
    private model: Model;
    private placeholder: ViewGroup;
    private maximumSegments = 4;
    private rootPath = "/users/{id}/{model-id}/@x@y@z~1.5434"

    public initialize(diagram: Diagram) {
        diagram.scope.subscribe(it => this.updateSegments(it));
    }

    private truncate(s: string, n: number, useWordBoundary: boolean){
        let isTooLong = (s.length > n),
        s_ = isTooLong ? s.substr(0, n - 1) : s;
        s_ = (useWordBoundary && isTooLong) ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
        return  isTooLong ? s_ + '...' : s_;
    }

    private updateSegments(level?: ViewGroup) {
        let segments = [];

        while (level) {
            segments.push(level);
            level = level.parent;
        }

        if (segments.length > this.maximumSegments && this.maximumSegments > 2) {
            this.segments = [segments[0], this.placeholder, segments[segments.length - 1]];
        } else {
            this.segments = segments.reverse();
        }
    }

    constructor() {
        this.placeholder = new ViewGroup("...", 0, 0, 0, 0, 1);
        this.placeholder.style = new Style();
        this.placeholder.style.cachedURL = "";
        this.segments = [];
    }
}
