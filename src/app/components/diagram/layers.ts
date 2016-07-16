import {Component, ElementRef, ViewChild, HostListener} from '@angular/core';
import {ViewGroup, ViewVertex} from "../../common/viewmodel/viewmodel";
import {Camera} from "../../common/camera";
import Grid from '../../common/grid';
import Border from '../../common/border';

/**
 * A diagram layer.
 */
export interface DiagramLayer {
    observe(camera: Camera)
}

/**
 * Grid layer component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'grid-layer',
    template: `<canvas #gridLayer class="layer"></canvas>`
})
export class GridLayer implements DiagramLayer {
    @ViewChild('gridLayer')
    private canvas: ElementRef;
    private grid: Grid;

    observe(camera: Camera) {
        let canvas = this.canvas.nativeElement;
        this.grid = new Grid(camera, canvas);
        camera.attachObserver(this.grid);
    }
}

/**
 * Grid layer component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'border-layer',
    template: '<canvas #borderLayer class="layer"></canvas>'
})
export class BorderLayer {
    @ViewChild('borderLayer')
    private element: ElementRef;
    private border: Border;

    observe(camera: Camera) {
        let canvas = this.element.nativeElement as HTMLCanvasElement;
        this.border = new Border(camera, canvas);
        camera.attachObserver(this.border);
    }

    update(group: ViewGroup) {
        if (this.border) {
            this.border.updateProxies(group);
        }
    }
}

/**
 * Grid layer component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'node-layer',
    template: '<canvas #nodeLayer class="layer"></canvas>'
})
export class NodeLayer {
    @ViewChild('nodeLayer')
    private _element: ElementRef;

    getElement(): HTMLCanvasElement {
        return this._element.nativeElement;
    }
}