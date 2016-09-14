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
    template: require('./overview.html'),
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
        setTimeout(() => this.redraw());
    }

    public onViewResized() {
        this.redrawCamera();
    }

    public onPanChanged(posX: number, posY: number) {
        this.redrawCamera();
    }

    public onZoomChanged(zoom: number) {
        this.redrawCamera();
    }

    private ngAfterViewInit() {
        let canvases = [
            this.nodeCanvas,
            this.camCanvas
        ]
        
        canvases.forEach((it: any) => {
            it.width = 128; 
            it.height
        });
        
        let brushes = canvases.map((it) => it.nativeElement as HTMLCanvasElement)
         .map((it) => it.getContext('2d'))
        this.nodes = brushes[0];
        this.cams = brushes[1];
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
            s = p.scale, mW = p.width, mH = p.height, DIM = 128;
        while (l--) {
            i = c[l];
            x = Math.round(i.left / mW * s * DIM);
            y = Math.round(i.top / mH * s * DIM);
            w = Math.round(i.width / mW * s * DIM);
            h = Math.round(i.height / mH * s * DIM);
            if (w > 0 && h > 0) brush.fillRect(x, y, w, h);
        }

        this.redrawCamera();
    }

    private redrawCamera() {
        if (!this.group) return;
        let brush = this.cams;

        brush.clearRect(-1, -1, 500, 500);
        brush.fillStyle = 'cornflowerblue';
        brush.globalAlpha = 0.4;

        const DIM = 128;
        let mW = this.group.width; 
        let mH = this.group.height;
        let cX = this.camera.worldX / mW * DIM;
        let cY = this.camera.worldY / mH * DIM;
        let cW = this.camera.projWidth / mW * DIM;
        let cH = this.camera.projHeight / mH * DIM;

        brush.fillRect(cX, cY, cW, cH);

        brush.fillStyle = 'cornflowerblue';
        brush.globalAlpha = 1;
        if (cX < 0) brush.fillRect(0, cY, 2, cH);
        if (cX + cW > DIM) brush.fillRect(DIM - 2, cY, 2, cH);
        if (cY < 0) brush.fillRect(cX, 0, cW, 2);
        if (cY + cH > DIM) brush.fillRect(cX, DIM - 2, cW, 2);
    }
}
