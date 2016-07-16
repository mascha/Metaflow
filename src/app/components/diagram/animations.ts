/**
 * Interpolator helper class, which encapsulates
 * requestAnimationFrame and onFinished callbacks.
 * @author Martin Schade
 * @since 1.0.0
 */
export class Interpolator {
    private start: number;
    private active = false;
    private frame: number;

    onFinished: () => void;

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
        if (this.active) {
            return;
        }
        this.active = true;
        this.start = Date.now();
        const self = this;
        const func = function() {
            if (self.active) {
                let f = (Date.now()-self.start)/self.duration;
                f = (f > 1) ? 1 : (f < 0) ? 0 : f;
                if (f < 1 && self.active) {
                    self.update(f);
                    self.frame = window.requestAnimationFrame(func);
                } else if (f >= 1 && self.onFinished) {
                    self.onFinished();
                    self.onFinished = null;
                }
            }
        };
        self.frame = window.requestAnimationFrame(func);
    }

    static throwCamera(params: any): Interpolator {
        const cam = params.camera;
        const time = -(1000.0 / params.frames) / Math.log(1.0 - params.decay);
        const rate = 1.0 / (1.0 - params.decay);
        const dist = params.speed * time / 4;
        const distX = dist * Math.cos(params.angle);
        const distY = dist * Math.sin(params.angle);
        return new Interpolator(f => {
            const t = 1 - Math.exp(-rate * f);
            const posX = cam.cameraX + t * distX;
            const posY = cam.cameraY + t * distY;
            cam.moveTo(-posX, -posY);
        }, time);
    }

    /**
     * Navigate to the given center coordinates.
     */
    static navigateTo(params: any): Interpolator {
        const camera = params.camera;
        const aW = camera.projWidth;
        const aX = camera.centerX;
        const aY = camera.centerY;
        const eW = params.targetWidth;
        const dX = params.centerX - aX;
        const dY = params.centerY - aY;
        const dU = Math.hypot(dX, dY);
        const z = params.panZoom;
        const v = params.velocity;

        /* Check if path is too short */
        if (dU < 1e-8) {
            const S = Math.log(eW/aW) / Math.SQRT2;
            return new Interpolator(f => {
                const tW = aW * Math.exp(Math.SQRT2 * S * f);
                const vW = camera.visualWidth;
                const vH = camera.visualHeight;
                const vZ = vW / tW;
                const x = (aX + dX * f);
                const y = (aY + dY * f);
                camera.zoomAndMoveTo(
                    vZ * x - vW / 2.0,
                    vZ * y - vH / 2.0,
                    vZ
                );
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
                const s = f * S;
                const u = m * (Math.tanh(z * s + r0) * ch - sh);
                const w = aW * ch / Math.cosh(z * s + r0);
                const vW = camera.visualWidth;
                const vH = camera.visualHeight;
                const vZ = vW / w;
                const x = aX + dX / dU * u;
                const y = aY + dY / dU * u;
                camera.zoomAndMoveTo(
                    vZ * x - vW / 2.0,
                    vZ * y - vH / 2.0,
                    vZ
                );
            }, Math.sqrt(1 + S) * params.pathFactor / v);
        }
    }

    constructor(private update: (f: number) => void,
                private duration: number) {
        this.duration = duration || 1000;
    }
}