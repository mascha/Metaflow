import {Component, ElementRef, ViewChild, HostListener} from '@angular/core';
import {ViewGroup} from "../../common/viewmodel";
import {Camera} from "../../common/camera";
import Grid from './grid';
import Border from './border';

/**
 * A diagram layer.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface DiagramLayer {
    observe(camera: Camera);
}

/**
 * Grid layer component.
 * 
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
export class BorderLayer implements DiagramLayer {
    @ViewChild('borderLayer') 
    private element: ElementRef;
    private border: Border;

    @HostListener('mousemove', ['$event']) 
    public onMove(event: MouseEvent) {
        // if (within border && hovers proxy) {}
    }

    public observe(camera: Camera) {
        let element = this.element.nativeElement;
        this.border = new Border(camera, element);
        camera.attachObserver(this.border);
    }

    public update(group: ViewGroup) {
        if (this.border) {
            this.border.updateProxies(group);
        }
    }
}

/**
 * Grid layer component.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'node-layer',
    template: '<canvas #nodeLayer class="layer"></canvas>'
})
export class NodeLayer implements DiagramLayer {
    @ViewChild('nodeLayer') 
    private element: ElementRef;

    observe(camera: Camera) {
        /* NOP */
    }

    getElement(): HTMLCanvasElement {
        return this.element.nativeElement;
    }
}
