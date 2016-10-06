import {CameraObserver, Camera} from '../../../common/camera';
import {Diagram} from '../../../common/layer';

/**
 * The grid layer is the lowest of all layers. It'scale job is to paint the background of the editor canvas,
 * where the implementation assumes that a tessellated grid with fixed cell sizes.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export default class Grid implements CameraObserver {
    private base: number = 10.0;
    private spacing: number = 1000.0;
    private _active: boolean = true;
    private _depthLevel: number = 1;
    private _brightness: number = 3;
    private _context: CanvasRenderingContext2D;
    private _canvas: HTMLCanvasElement;
    private _camera: Camera;

    onViewResized() {
        const newWidth = this._camera.visualWidth;
        const newHeight = this._camera.visualHeight;
        this._canvas.width = newWidth;
        this._canvas.height = newHeight;
        this.redraw();
    }

    onPanChanged(posX: number, posY: number) {
        this.redraw();
    }

    onZoomChanged(zoom: number) {
        this.redraw();
    }

    private drawGrid(worldX: number, worldY: number, worldW: number, worldH: number) {
        const space = this.spacing / this._camera.scale;
        const scale = Math.log(space) / - Math.log(this.base);
        const min = Math.floor(scale) + 1;
        const max = min + this._depthLevel;

        const vW = this._camera.visualWidth;
        const vH = this._camera.visualHeight;
        const cx = this._camera.cameraX;
        const cy = this._camera.cameraY;
        const cZ = this._camera.scale;
        const b = this.base;
        
        for (let level = min; level <= max; level++) {
            const context = this._context;
            const period = Math.pow(b, -level);
            const amplit = Math.pow(b, -level + scale);
            const normal = 2 * Math.atan(this._brightness * amplit) / Math.PI;
            const alpha = (normal > 1) ? 1 : (normal < 0) ? 0 : normal;
            const starX = Math.floor(worldX / period);
            const starY = Math.floor(worldY / period);
            const stopX = Math.ceil((worldX + worldW) / period);
            const stopY = Math.ceil((worldY + worldH) / period);

            context.globalAlpha = alpha;
            context.beginPath();

            for (let x = starX; x <= stopX; x++) {
                const projX = Math.round(cx + cZ * (x * period)) + 0.5;
                context.moveTo(projX, 0);
                context.lineTo(projX, vH);
            }

            for (let y = starY; y <= stopY; y++) {
                const projY = Math.round(cy + cZ * (y * period)) + 0.5;
                context.moveTo(0, projY);
                context.lineTo(vW, projY);
            }

            context.stroke();
        }
    }

    private redraw() {
        if (!this._active) return;
        this._context.clearRect(0,0,this._canvas.width,this._canvas.height);
        this._context.strokeStyle = 'lightgray';
        this._context.lineWidth = 1.0;
        const x = this._camera.worldX;
        const y = this._camera.worldY;
        const w = this._camera.projWidth;
        const h = this._camera.projHeight;
        this.drawGrid(x, y, w, h);
    }

    constructor(diagram: Diagram, canvas: HTMLCanvasElement) {
        this._camera = diagram.camera;
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
    }
}
