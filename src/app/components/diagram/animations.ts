import {Camera} from '../../common/camera';
import {ViewVertex} from '../../common/viewmodel';

/**
 * Interpolator helper class, which encapsulates
 * requestAnimationFrame and onFinished callbacks.
 * @author Martin Schade
 * @since 1.0.0
 */
export class Interpolator {

    onFinished: () => void;
    private start: number;
    private frame: number;
    private active = false;
    private callback = () => {
        if (this.active) {
            let f = (Date.now() - this.start) / this.duration;
            f = (f > 1) ? 1 : (f < 0) ? 0 : f;
            if (f < 1 && this.active) {
                this.update(f);
                this.frame = window.requestAnimationFrame(this.callback);
            } else if (f >= 1 && this.onFinished) {
                this.onFinished();
                this.onFinished = null;
            }
        }
    }

    /**
     * Stop the animation
     */
    stop() {
        if (this.frame) {
            window.cancelAnimationFrame(this.frame);
        }

        this.onFinished = undefined;
        this.frame = undefined;
        this.active = false;
        this.update = undefined;
    }

    play() {
        if (this.active) return;
        this.active = true;
        this.start = Date.now();
        this.frame = window.requestAnimationFrame(
            this.callback
         );
    }

    static throwCamera(params: ThrowConfig): Interpolator {
        const cam = params.camera;
        const dist = params.speed * params.duration;
        const startX = cam.cameraX;
        const startY = cam.cameraY;
        const distX = dist * Math.cos(params.angle);
        const distY = dist * Math.sin(params.angle);
        return new Interpolator(f => {
            const t = f * (2 - f);
            const posX = startX + t * distX;
            const posY = startY + t * distY;
            cam.moveTo(-posX, -posY);
        }, params.duration);
    }


    static navigateToItem(cam: Camera, vertex: ViewVertex): Interpolator {
        // TODO what if parent == null ? 
        let parent = vertex.parent;
        return Interpolator.navigateTo({
            camera: cam,
            targetX: (vertex.left + vertex.width / 2) * parent.scale,
            targetY: (vertex.top + vertex.height / 2) * parent.scale,
            panZoom: 3.2,
            velocity: 1,
            targetWidth: vertex.width / vertex.parent.scale,
            pathFactor: 1000
        })
    }

    /**
     * Pan the camera and center on the given world coordinates.
     */
    static centerOnWorld(centerX: number, centerY: number, time: number, camera: Camera) : Interpolator {
        const diffX = (centerX - camera.cameraX) / camera.scale;
        const diffY = (centerY - camera.cameraY) / camera.scale;
        return new Interpolator(f => {
            camera.moveTo(
                - (camera.cameraX + diffX * f),
                - (camera.cameraY + diffY * f)
                );
        }, time);
    }

    /**
     * Navigate to the given center coordinates.
     */
    static navigateTo(params: NavigateConfig): Interpolator {
        const camera = params.camera;
        const aW = camera.projWidth;
        const aX = camera.centerX;
        const aY = camera.centerY;
        const eW = params.targetWidth;
        const dX = params.targetX - aX;
        const dY = params.targetY - aY;
        const dU = Math.hypot(dX, dY);
        const z = params.panZoom;
        const v = params.velocity;

        /* Check if path is too short */
        if (dU < 1e-8) {
            const S = Math.log(eW/aW) / Math.SQRT2;
            return new Interpolator(f => {
                const t = f * (2 - f);
                const tW = aW * Math.exp(Math.SQRT2 * S * t);
                const vW = camera.visualWidth / 2;
                const vH = camera.visualHeight / 2;
                const vZ = 2 * vW / tW;
                const x = (aX + dX * f) * vZ;
                const y = (aY + dY * f) * vZ;
                camera.zoomAndMoveTo(x - vW,y - vH, vZ);
            }, Math.sqrt(1 + S) * params.pathFactor / v);
        } else {
            const dZ = z * z * dU;
            const dA = eW * eW - aW * aW;
            const b0 = (dA + dZ * dZ) / (2.0 * aW * dZ);
            const b1 = (dA - dZ * dZ) / (2.0 * eW * dZ);
            const f0 = Math.sqrt(1.0 + b0 * b0) - b0;
            const f1 = Math.sqrt(1.0 + b1 * b1) - b1;
            const r0 = Math.log(f0 > 0 ? f0 : 1e-12);
            const r1 = Math.log(f1 > 0 ? f1 : 1e-12);
            const ch = Math.cosh(r0);
            const sh = Math.sinh(r0);
            const S = (r1 - r0) / z;
            const m = aW / (z * z);
            return new Interpolator(f => {
                const s = f * (2 - f) * S;
                const u = m * (Math.tanh(z * s + r0) * ch - sh);
                const w = aW * ch / Math.cosh(z * s + r0);
                const vW = camera.visualWidth / 2;
                const vH = camera.visualHeight / 2;
                const vZ = 2 * vW / w;
                const x = (aX + dX / dU * u) * vZ;
                const y = (aY + dY / dU * u) * vZ;
                camera.zoomAndMoveTo(x - vW, y - vH, vZ);
            }, Math.sqrt(1 + S) * params.pathFactor / v);
        }
    }

    constructor(private update: (f: number) => void,
                private duration: number) {
        this.duration = duration || 1000;
    }
}

export interface ThrowConfig {
    camera: Camera,
    speed: number,
    angle: number,
    duration: number
}

export interface NavigateConfig {
    targetX : number;
    targetY : number;
    panZoom : number;
    velocity: number;
    camera : Camera;
    targetWidth: number;
    pathFactor: number;
}