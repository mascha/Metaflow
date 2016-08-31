import {Component, ElementRef, ViewChild, HostListener} from '@angular/core';
import {ViewGroup, ViewItem, ViewVertex} from "../../common/viewmodel";
import {Camera, CameraObserver} from "../../common/camera";
import Grid from './grid';
import Border from './border';
import HTML from '../../common/utility';

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
 * A view model renderer.
 *
 * @author Martin Schade.
 * @since 1.0.0
 */
export interface ViewModelRenderer<I, G> {

    /**
     * Render a view item.
     */
    renderItem(item: ViewItem): I;

    /**
     * Render a view group.
     */
    renderGroup(group: ViewGroup, topLevel: boolean, oblique: boolean): G;

    /**
     *
     */
    attach(node: ViewVertex, group: ViewGroup)
}

export const enum Quality {
    EPIC = 1.0,
    HIGH = 0.8,
    MEDIUM = 0.6,
    LOWER = 0.4,
    LOW = 0.2,
    LOWEST = 0
}
    

/**
 * Responsible for handling the platform dependent methods.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface PlatformLayer extends CameraObserver {

    cachedGroups: Array<ViewGroup>;

    /**
     * Sets the amount of quality to accept.
     */
    setQuality(quality: Quality);

    /**
     * Retrieve the platform camera.
     */
    getCamera(): Camera;
    
    /**
     * Update and render model.
     */
    setModel(model: ViewGroup)
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
 * 
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
    private onMove(event: MouseEvent) {
        let can = this.element.nativeElement as HTMLCanvasElement;
        let pos = HTML.getOffset(can, event);
        let ins = this.border.borderWidth;
        let left = pos.x < ins, right = pos.x < can.width - ins;
        let top = pos.y < ins, bottom = pos.y < can.height - ins;
        if (top || left || bottom || right) {
            this.border.showPreview(pos.x, pos.y);
        }
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
