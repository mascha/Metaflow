
/**
 * Provides kinetic state keeping. Keeps track of position, speed and angle.
 *
 * Every time a change is made, update the state via the [update] method, then
 * ask whether to use the inertial scrolling behavior by using [enoughMomentum].
 *
 * @property speed The current magnitude of the velocity in px/ms.
 * @property angle The current direction of the velocity in rad.
 * @property smoothness A value between zero and smaller than one. Values around zero
 *                      must produce a very direct, snappy speed and angle resolution,
 *                      while higher values around one must produce more inert behavior.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export default class Kinetics {

    get smoothness(): number { return this._smooth; }

    set smoothness(s: number) { this._smooth = (s < 0) ? 0 : (s > 1) ? 1 : s; }

    get speed(): number { return this._speed; }

    get angle(): number { return this._angle; }

    maximumDelay = 33; // <ms>
    minimumSpeed = .2 // <pixel/ms>

    private _speed = 0.0;
    private _angle = 0.0;
    private _smooth = 0.9;
    private _lastX = 0.0;
    private _lastY = 0.0;
    private _lastT = 0.0;
    private velX = 0.0;
    private velY = 0.0;

    /**
     * Update the internal state.
     * @param posX
     * @param posY
     */
    update(posX: number, posY: number) {
        const x = -posX;
        const y = -posY;
        const t = Date.now();

        if (this._lastX && this._lastY && this._lastT) {
            const dt = (t - this._lastT);
            const vx = (x - this._lastX) / dt;
            const vy = (y - this._lastY) / dt;
            const s = this._smooth;
            this.velX = (1 - s) * vx + s * this.velX;
            this.velY = (1 - s) * vy + s * this.velY;
            this._angle = Math.atan2(this.velY, this.velX);
            this._speed = Math.hypot(this.velX, this.velY);
        }

        this._lastX = x;
        this._lastY = y;
        this._lastT = t;
    }

    /**
     * Check whether a) the momentum is big enough to warrant kinetic behavior
     * and b) if the user stopped the motion mid-progress.
     * @returns {boolean}
     */
    hasEnoughMomentum(): boolean {
        if (!this._lastT) {
            return false;
        }
        if (this._speed <= this.minimumSpeed) {
            return false;
        }
        const minLimit = Date.now() - this.maximumDelay;
        return this._lastT >= minLimit;
    }

    /**
     * Reset the internal state.
     */
    reset() {
        this._lastX = NaN;
        this._lastY = NaN;
        this._lastT = NaN;
        this._speed = 0.0;
        this._angle = 0.0;
        this.velX = 0.0;
        this.velY = 0.0;
    }
}
