import {Component, ElementRef, ViewChild} from '@angular/core';
import {ViewGroup, ViewVertex} from '../../../common/viewmodel';
import {Camera, CameraObserver} from '../../../common/camera';
import {DiagramLayer} from '../layers';

/**
 * Birds-eye overview component.
 * 
 * @author Martin Schade.
 * @since 1.0.0
 */
@Component({
    selector: 'overview',
    template: '<canvas #camera></canvas><canvas #nodes></canvas>',
    styles: [require('./overview.scss')]
})
export default class Overview implements DiagramLayer, CameraObserver {
    @ViewChild('camera') private camCanvas: ElementRef;
    @ViewChild('nodes') private nodeCanvas: ElementRef;
    private nodes: CanvasRenderingContext2D;
    private cams: CanvasRenderingContext2D;
    private camera: Camera;
    private group: ViewGroup;

    public observe(camera: Camera) {
        this.camera = camera;
        camera.attachObserver(this);
    }
    
    public update(group: ViewGroup) {
        this.group = group;
        this.redraw();
    }

    public onViewResized() {
        /* NOP */
    }

    public onPanChanged(posX: number, posY: number) {
        this.redrawCamera();
    }

    public onZoomChanged(zoom: number) {
        this.redrawCamera();
    }

    private ngAfterViewInit() {
        let canvas1 = (this.nodeCanvas.nativeElement as HTMLCanvasElement);
        this.nodes = canvas1.getContext('2d');
        let canvas2 = (this.camCanvas.nativeElement as HTMLCanvasElement);
        this.cams = canvas2.getContext('2d');
    }

    private redraw() {
        let brush = this.nodes;
        brush.clearRect(-1, -1, 500, 500);
        brush.fillStyle = 'darkgray';
        brush.globalAlpha = 1;

        let p = this.group;
        let c = p ? p.contents : null;
        let l = c ? c.length : 0;
        let x = 0, y = 0, w = 0, h = 0, i : ViewVertex = null,
            mW = p.width, mH = p.height, DIM = 128;
        while (l--) {
            i = c[l];
            x = Math.round(i.left / mW) * DIM;
            y = Math.round(i.top / mH) * DIM;
            w = Math.round(i.width / mW) * DIM;
            h = Math.round(i.height / mH) * DIM;
            // if (w > 0 && h > 0) 
            brush.fillRect(x, y, 1, 1);
        }

        this.redrawCamera();
    }

    private redrawCamera() {
        if (!this.group) return;
        let brush = this.cams;
        brush.clearRect(-1, -1, 500, 500);
        brush.fillStyle = 'cornflowerblue';
        brush.globalAlpha = 0.2;
        let x = this.camera.castRayX(this.camera.cameraX);
        let y = this.camera.castRayY(this.camera.cameraY);
        let mW = this.group.width, mH = this.group.height, DIM = 128;
        brush.fillRect(
            x / mW * DIM, 
            y / mH * DIM, 
            this.camera.projWidth / mW * DIM, 
            this.camera.projHeight / mH * DIM 
        );
    }
}
