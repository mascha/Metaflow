import {Component, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import {ViewGroup, ViewNode} from '../../../../common/viewmodel';
import {Camera, CameraObserver} from '../../../../common/camera';
import {Layer, Diagram} from '../../../../common/layer';

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
export class Overview implements Layer<Diagram>, CameraObserver, AfterViewInit {
    @ViewChild('camera') private camCanvas: ElementRef;
    @ViewChild('nodes') private nodeCanvas: ElementRef;
    private nodes: CanvasRenderingContext2D;
    private cams: CanvasRenderingContext2D;
    private camera: Camera;
    private group: ViewGroup;
    private active: boolean = true;

    initialize(diagram: Diagram) {
        this.camera = diagram.camera;
        diagram.camera.subscribe(this);
        diagram.scope.subscribe(it => this.updateGroup(it));
    }

    setActive(active: boolean) {
        this.active = active;
    }

    isActive() {
        return this.active;
    }
    
    onViewResized() {
        this.redrawCamera();
    }

    onPanChanged(posX: number, posY: number) {
        this.redrawCamera();
    }

    onZoomChanged(zoom: number) {
        this.redrawCamera();
    }

    ngAfterViewInit() {
        let canvases = [
            this.nodeCanvas,
            this.camCanvas
        ];
        
        canvases.forEach((it: any) => {
            it.width = 128; 
            it.height = 128;
        });
        
        let brushes = canvases
            .map((it) => it.nativeElement as HTMLCanvasElement)
            .map((it) => it.getContext('2d'));
        this.nodes = brushes[0];
        this.cams = brushes[1];
    }
    
    private updateGroup(group?: ViewGroup) {
        if (!group) return;
        this.group = group;
        this.redraw();
    }

    private redraw() {
        let brush = this.nodes;
        brush.clearRect(-1, -1, 500, 500);
        brush.fillStyle = 'darkgray';
        brush.globalAlpha = 1;

        let p = this.group;
        let c = p ? p.contents : null;
        let l = c ? c.length : 0;
        let x = 0, y = 0, w = 0, h = 0, i : ViewNode = null,
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
        brush.strokeStyle = 'royalblue';
        brush.globalAlpha = 0.4;

        const DIM = 128;
        let mW = this.group.width; 
        let mH = this.group.height;
        let cX = this.camera.worldX / mW * DIM;
        let cY = this.camera.worldY / mH * DIM;
        let cW = this.camera.projWidth / mW * DIM;
        let cH = this.camera.projHeight / mH * DIM;
        brush.fillRect(cX, cY, cW, cH);
        brush.strokeRect(cX, cY, cW, cH);

        brush.globalAlpha = 1;
        if (cX < 0) brush.fillRect(0, cY, 2, cH);
        if (cX + cW > DIM) brush.fillRect(DIM - 2, cY, 2, cH);
        if (cY < 0) brush.fillRect(cX, 0, cW, 2);
        if (cY + cH > DIM) brush.fillRect(cX, DIM - 2, cW, 2);
    }
}
