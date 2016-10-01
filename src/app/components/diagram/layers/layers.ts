import {Component, ElementRef, ViewChild, HostListener} from '@angular/core';
import {ViewGroup, ViewItem, ViewVertex} from "../../../common/viewmodel";
import {Camera, CameraObserver} from "../../../common/camera";
import {PlatformLayer, Layer, Quality, Diagram} from '../../../common/layer';
import Grid from './grid';
import Border from './border';
import HTML from '../../../common/utility';

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
export class GridLayer implements Layer {
    @ViewChild('gridLayer') 
    private canvas: ElementRef;
    private grid: Grid;

    public initialize(diagram: Diagram) {
        let canvas = this.canvas.nativeElement;
        this.grid = new Grid(diagram.camera, canvas);
        diagram.camera.attachObserver(this.grid);
    }
}

/**
 * Effect layer component.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'effect-layer',
    template: require('./effects.html'),
    styles: [require('./effects.scss')]
})
export class EffectLayer implements Layer {
    @ViewChild('effects') private surface: ElementRef;
    @ViewChild('misc') private misc: ElementRef;

    private canvas: HTMLCanvasElement;
    private brush: CanvasRenderingContext2D;

    /**
     * Draws an panning overlay effect.
     */
    public drawLimits(left: number, top: number, right: number, bottom: number) {
        let brush = this.brush;
        let height = this.canvas.height, width = this.canvas.width;
        brush.fillRect(0, 0, height, width);
        brush.clearRect(left, top, width - right, height - bottom);
    }

    /**
     * Adds an expanding dot to the given position. 
     * Add an grow animation to your css file.
     */
    public playClickEffect(position: any, color?: string) {
        let element = this.misc.nativeElement;
        if (!element) return;

        let container = document.createElement('div');
        container.style.top = position.y + "px";
        container.style.left = position.x + "px";
        container.style.position = "absolute";
        let object = document.createElement('div');
        object.style.width = "5px";
        object.style.height = "5px";
        object.style.backgroundColor = color || 'rgba(0, 0, 0, 0.2)';
        object.style.animation = "grow .3s linear forwards";
        object.style.borderRadius = "50%";
        object.style.transform = "translate(-50%, -50%)";
        container.appendChild(object);
        element.appendChild(container);
        setTimeout(() => container.remove(), 1000);
    }

    public initialize(diagram: Diagram) {
        let canvas = this.surface.nativeElement as HTMLCanvasElement;
        let brush = canvas.getContext("2d");
        brush.fillStyle = "black";
        brush.globalAlpha = 0.2;
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
export class BorderLayer implements Layer {
    @ViewChild('borderLayer') 
    private element: ElementRef;
    private border: Border;

    @HostListener('mousemove', ['$event']) 
    private onMove(event: MouseEvent) {
        let can = this.element.nativeElement as HTMLCanvasElement;
        let pos = HTML.getOffset(can, event);
        let ins = this.border.borderWidth;
        let left = pos.x < ins, right = pos.x > can.width - ins;
        let top = pos.y < ins, bottom = pos.y > can.height - ins;
        if (top || left || bottom || right) {
            this.border.showPreview(pos.x, pos.y);
        }
    }

    public initialize(diagram: Diagram) {
        let element = this.element.nativeElement;
        this.border = new Border(diagram.camera, element);
        diagram.camera.attachObserver(this.border);
        diagram.scope.scope.subs
    }

    public update(group: ViewGroup) {
        if (this.border) {
            this.border.updateProxies(group);
        }
    }
}

/**
 * Responsible for handling the platform dependent methods.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface PlatformLayer extends CameraObserver, Layer {

    cachedGroups: Array<ViewGroup>;

    /**
     * Sets the amount of quality to accept.
     */
    setQuality(quality: Quality);

    /**
     * Retrieve the platform camera.
     */
    getCamera(): Camera;
}
