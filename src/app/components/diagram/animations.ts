import {Camera} from '../../common/camera';
import {ViewVertex} from '../../common/viewmodel';
import Diagram from './diagram';

const NAVIGATION_FACTOR = 1000;

export const EASE_OUT = (f: number) => { return f * (2 - f); };
export const EASE_IN_OUT = (f: number) => { return f * f * (3 - 2 * f); }
export const EASE_IN = (f: number) => { return f * f; }
export const EASE_NONE = (f: number) => { return f; }

/**
 * Animation helper class, which encapsulates
 * requestAnimationFrame and onFinished callbacks.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Animation {
    public onFinished: () => void;
    private start: number;
    private frame: number;
    private active = false;
    private callback = () => {
        if (this.active) {
            let f = (Date.now() - this.start) / this.duration;
            f = (f > 1) ? 1 : (f < 0) ? 0 : f;
            f = this.interpolator ? this.interpolator(f) : f;
            if (f < 1) {
                this.update(f);
                this.frame = window.requestAnimationFrame(this.callback);
            } else if (this.onFinished) {
                this.onFinished();
                this.onFinished = null;
            }
        }
    }

    public stop() {
        if (this.frame) {
            window.cancelAnimationFrame(this.frame);
        }

        this.onFinished = undefined;
        this.frame = undefined;
        this.active = false;
        this.update = undefined;
    }

    public play() {
        if (this.active) return;
        this.active = true;
        this.start = Date.now();
        this.frame = window.requestAnimationFrame(
            this.callback
        );
    }

    static zoomIn(camera: Camera, factor: number, duration: number) {
        if (factor <= 0 || duration <= 0) return;
        const start = camera.scale;
        const end = start * factor;
        const wX = camera.centerX;
        const wY = camera.centerY;
        return new Animation(f => {
            camera.zoomToAbout(start + end * f, wX, wY);
        }, duration || 300, EASE_IN_OUT)
    }

    static throwCamera(camera: Camera, speed: number, angle: number, duration: number): Animation {
        const dist = speed * duration;
        const startX = camera.cameraX;
        const startY = camera.cameraY;
        const distX = dist * Math.cos(angle);
        const distY = dist * Math.sin(angle);
        return new Animation(f => {
            const posX = startX + f * distX;
            const posY = startY + f * distY;
            camera.moveTo(-posX, -posY);
        }, duration || 300, EASE_OUT);
    }

    static navigateToItem(cam: Camera, diagram: Diagram, vertex: ViewVertex): Animation {
        let parent = vertex.parent;
        let scale = parent ? parent.scale : 1.0;
        let adjust = parent ? 16 : 2;
        let width = parent ? vertex.width * adjust * scale : vertex.width;
        return Animation.navigateTo({
                camera: cam,
                targetX: vertex.centerX * scale,
                targetY: vertex.centerY * scale,
                panZoom: diagram.zoomPanPreference,
                velocity: diagram.navigationVelocity,
                targetWidth: vertex.width * adjust * scale,
        });
    }

    static centerOnWorld(centerX: number, centerY: number, duration: number, camera: Camera): Animation {
        const diffX = (centerX - camera.cameraX) / camera.scale;
        const diffY = (centerY - camera.cameraY) / camera.scale;
        return new Animation(f => {
            camera.moveTo(
                - (camera.cameraX + diffX * f),
                - (camera.cameraY + diffY * f)
            );
        }, duration || 300, EASE_OUT);
    }

    static navigateTo(params: NavigateConfig): Animation {
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

        if (dU < 1e-8) {
            const S = Math.log(eW / aW) / Math.SQRT2;
            return new Animation(f => {
                const tW = aW * Math.exp(Math.SQRT2 * S * f);
                const vW = camera.visualWidth / 2;
                const vH = camera.visualHeight / 2;
                const vZ = 2 * vW / tW;
                const x = (aX + dX * f) * vZ;
                const y = (aY + dY * f) * vZ;
                camera.zoomAndMoveTo(x - vW, y - vH, vZ);
            }, 
            Math.sqrt(1 + S) * NAVIGATION_FACTOR / v,
            EASE_OUT);
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
            return new Animation(f => {
                const s = f * S;
                const u = m * (Math.tanh(z * s + r0) * ch - sh);
                const w = aW * ch / Math.cosh(z * s + r0);
                const vW = camera.visualWidth / 2;
                const vH = camera.visualHeight / 2;
                const vZ = 2 * vW / w;
                const x = (aX + dX / dU * u) * vZ;
                const y = (aY + dY / dU * u) * vZ;
                camera.zoomAndMoveTo(x - vW, y - vH, vZ);
            }, 
            Math.sqrt(1 + S) * NAVIGATION_FACTOR / v,
            EASE_OUT);
        }
    }

    constructor(
        private update: (number) => void,
        private duration: number,
        private interpolator?: (number) => number) {
        this.interpolator = interpolator || null;
        this.duration = duration || 1000;
    }
}

export interface NavigateConfig {
    targetX: number;
    targetY: number;
    panZoom: number;
    velocity: number;
    camera: Camera;
    targetWidth: number;
}