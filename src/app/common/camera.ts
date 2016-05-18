/**
 * A listener that can be attached to track the position,
 * viewport dimensions and scale levels of the camera.
 *
 * @since 1.0.0
 * @author Martin Schade
 */
export interface CameraObserver {
    onViewResized();
    onPanChanged(posX: number, posY: number);
    onZoomChanged(zoom: number);
}

/**
 * Camera class.
 *
 * A camera provides a viewport onto a layered scene canvas. It is used to
 * specify scale levels and provide breadcrumbs and view state undo/redo functionality.
 *
 * There are two main coordinate systems which determine the way the camera operates:
 *  1) The camera, viewport, visual or viewport coordinate system, which represents the
 *     actual drawing and interaction area for the user. The canvas system always starts
 *     in the top-left corner (0,0) and fully occupies the visual width and height, which
 *     are retrievable by [visualWidth] and [visualHeight].
 *
 *  2) The world coordinate system, which is used to simulate a infinitely zoomable space.
 *     To accomplish panning, the world is translated by a negative offset.
 *
 * The camera and world coordinate systems are expected to originate in the top-left corner.
 * Positive left-values result in eastward movement, while positive top-values result in southward movement.
 *
 * Between those spaces a simple linear transformation is performed. The [castRayX] and
 * [castRayY] transform canvas to world coordinates; and the [inverseRayX] and [inverseRayY]
 * do the opposite, from world to camera space coordinates and whose resulting values need
 * not be inside the visible drawing area. The camera does track it'scale position in both systems.
 * The current values can be retrieved by the [cameraX], [cameraY], [worldX] and [worldY]
 * functions.
 *
 * [moveBy] performs a repositioning relative to the cameras current position, while [moveTo] used
 * absolute positioning. Both assume world coordinates.
 *
 * @since 1.0.0
 * @author Martin Schade
 */
export abstract class Camera {
    
    get cameraX():number {
        return this.camX;
    }

    get cameraY():number {
        return this.camY;
    }

    get worldX():number {
        return this.adjX;
    }

    get worldY():number {
        return this.adjY;
    }

    get projWidth():number {
        return this.adjW;
    }

    get projHeight():number {
        return this.adjH;
    }

    get centerX():number {
        return this.adjX + this.adjW / 2;
    }

    get centerY():number {
        return this.adjY + this.adjH / 2;
    }

    get visualWidth():number {
        return this.viewW;
    }

    get visualHeight():number {
        return this.viewH;
    }

    get visualCenterX():number {
        return this.viewX + this.viewW / 2;
    }

    get visualCenterY(): number {
        return this.viewY + this.viewH / 2;
    }

    get scale(): number {
        return this._scale;
    }

    private isZooming = false;
    private viewX = 0.0;
    private viewY = 0.0;
    private viewW = 0.0;
    private viewH = 0.0;
    private camX = 0.0;
    private camY = 0.0;
    private _scale = 1.0;
    private adjX = 0.0;
    private adjY = 0.0;
    private adjW = -1.0;
    private adjH = -1.0;
    private obs = Array<CameraObserver>();

    /**
     * Attach a observer to this camera.
     */
    attachObserver(observer:CameraObserver) {
        this.obs.push(observer);
    }

    /**
     * Transform a canvas coordinate into world coordinates.
     * @param canvasX {number} the horizontal position on the canvas.
     * @returns {number}
     */
    castRayX(canvasX:number): number {
        return (canvasX - this.camX) / this._scale;
    }

    /**
     * Transforms a canvas coordinate into world coordinates.
     * @param canvasY {number} the vertical position on the canvas.
     * @returns {number}
     */
    castRayY(canvasY:number): number {
        return (canvasY - this.camY) / this._scale;
    }

    /**
     * Transform world coordinates into the camera space.
     * @param worldX
     */
    inverseRayX(worldX: number) {
        return this.camX + this._scale * worldX;
    }

    /**
     * Transform world coordinates into the camera space.
     * @param worldY
     */
    inverseRayY(worldY:number) {
        return this.camY + this._scale * worldY;
    }

    /**
     * Sets the new scale level with the given point as it'scale pivot.
     * @param zoomLevel
     * @param worldX
     * @param worldY
     */
    zoomToAbout(zoomLevel:number, worldX:number, worldY:number) {
        if (zoomLevel <= 0) return;
        try {
            this.isZooming = true;
            const oldZoom = this._scale;
            this._scale = zoomLevel;

            /* platform scaling */
            this.scaleWorldTo(zoomLevel);

            /* correct for scale difference */
            const dZ = zoomLevel - oldZoom;
            this.moveBy(dZ * worldX, dZ * worldY);

            /* notify and release */
            this.updateCache();

            let length = this.obs.length;
            for (let i = 0; i < length; i++) {
                this.obs[i].onZoomChanged(zoomLevel);
            }
        } finally {
            this.isZooming = false;
        }
    }

    /**
     * Move the camera by the given delta values.
     * @param deltaX
     * @param deltaY
     */
    moveBy(deltaX:number, deltaY:number) {
        this.moveTo(deltaX - this.camX, deltaY - this.camY);
    }

    /**
     * Moves the camera to the given position.
     * @param positionX
     * @param positionY
     */
    public moveTo(positionX:number, positionY:number) {
        this.camX = -positionX;
        this.camY = -positionY;
        
        this.translateWorldTo(
            this.camX,
            this.camY
        );

        if (!this.isZooming) {
            this.updateCache();
            let length = this.obs.length;
            for (let i = 0; i < length; i++) {
                this.obs[i].onPanChanged(positionX, positionY);   
            }
        }
    }

    /**
     * First zooms to the given level and then moves the camera to the given position.
     *
     * It it a more performant option to manually setting the translation and scale
     * because only a single pan update notification will be dispatched to the observers.
     * @param positionX
     * @param positionY
     * @param zoom Must not be negative or zero.
     */
    zoomAndMoveTo(positionX:number, positionY:number, zoom:number) {
        if (zoom <= 0) return;
        
        this._scale = zoom;
        this.camX = -positionX;
        this.camY = -positionY;

        this.scaleWorldTo(zoom);
        this.translateWorldTo(this.camX, this.camY);
        this.updateCache();

        let obs = this.obs;
        let len = obs.length;
        for (let i = 0; i < len; i++) {
            obs[i].onPanChanged(positionX, positionY);
        }
    }

    /**
     * Update the internal paintable surface metrics.
     */
    updateVisual(viewX:number, viewY:number, viewW:number, viewH:number) {
        this.viewX = viewX;
        this.viewY = viewY;
        this.viewW = viewW;
        this.viewH = viewH;
        this.updateCache();
        let len = this.obs.length;
        for (let i = 0; i < len; i++) {
            this.obs[i].onViewResized();
        }
    }

    protected abstract translateWorldTo(tX:number, tY:number):void

    protected abstract scaleWorldTo(zoom:number):void

    private updateCache() {
        const zoom = this._scale;
        this.adjX = (this.viewX - this.camX) / zoom;
        this.adjY = (this.viewY - this.camY) / zoom;
        this.adjW = this.viewW / zoom;
        this.adjH = this.viewH / zoom;
    }

    constructor() {
        this.updateCache();
    }
}

/**
 * A camera frame.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class ViewFrame {

    get y(): number {
        return this._y;
    }

    get x(): number {
        return this._x;
    }

    get w(): number {
        return this._w;
    }

    /**
     * Creates a view frame from the given camera.
     * @param camera
     * @returns {ViewFrame}
     */
    static fromCamera(camera:Camera):ViewFrame {
        let x = camera.worldX;
        let y = camera.worldY;
        let w = camera.visualWidth / camera.scale;
        return new ViewFrame(x, y, (w < 0.0 || !w) ? 1.0 : w);
    }

    constructor(private _x:number,
                private _y:number,
                private _w:number) {
    }
}

/**
 * Camera history.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class History<T> {

    private future: Array<T>;
    private past: Array<T>;
    private current: T;

    /**
     * Returns the next camera view;
     */
    next(): T {
        this.past.push(this.current);
        this.current = this.future.pop();
        return this.current;
    }

    /**
     * Returns the last camera view.
     */
    previous(): T {
        this.future.push(this.current);
        this.current = this.past.pop();
        return this.current;
    }

    /**
     * Clears all future frames, remembers the current frame and sets the current
     * frame to the given one.
     * @param t
     */
    add(t: T) {
        if (t) {
            this.future = [];
            this.past.push(this.current);
            this.current = t;
        }
    }

    constructor(initial: T) {
        this.current = initial;
    }
}
