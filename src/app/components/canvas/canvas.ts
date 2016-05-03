/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {Component, ElementRef, ViewChild, AfterViewInit} from 'angular2/core';
import {ICameraObserver, Camera} from './camera';
import {KonvaRenderer, KonvaCamera} from "../platform/konva";
import {ViewGroup} from "./viewmodel";
import {IViewModelRenderer} from "./renderer";
import Grid from './grid';
import Border from './border';
import Breadcrumbs from "../breadcrumb/breadcrumbs";

/**
 * Grid layer component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'grid-layer',
    template: `<canvas #gridLayer class="layer"></canvas>`
})
class GridLayer {
    @ViewChild('gridLayer')
    private _canvas: ElementRef;
    private _grid: Grid;

    observe(camera: Camera) {
        let canvas = this._canvas.nativeElement;
        this._grid = new Grid(camera, canvas);
        camera.attachObserver(this._grid);
    }
}

/**
 * Grid layer component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'border-layer',
    template: '<canvas #borderLayer class="layer"></canvas>'
})
class BorderLayer {
    @ViewChild('borderLayer')
    private _element: ElementRef;
    private _border: Border;

    observe(camera: Camera) {
        let canvas = this._element.nativeElement as HTMLCanvasElement;
        this._border = new Border(camera, canvas);
        camera.attachObserver(this._border);
    }
}

/**
 * Node layer component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'node-layer',
    template: ''
})
class NodeLayer implements ICameraObserver {
    private camera: Camera;
    private render: IViewModelRenderer<any, any>;
    private stage: Konva.Stage;
    private nodes: Konva.Layer;

    observe(camera: Camera) {
        camera.attachObserver(this);
    }

    retrievePlatformCamera(): Camera {
        return this.camera;
    }

    setModel(group: ViewGroup) {
        this.nodes.removeChildren();
        this.nodes.add(group.visual);
    }

    onViewResized() {
        let width = this.camera.visualWidth;
        let height = this.camera.visualHeight;
        this.stage.width(width);
        this.stage.height(height);
        this.draw();
    }

    onPanChanged(panX: number, panY: number) {
        this.draw();
    }

    onZoomChanged(zoom: number) {
        this.draw();
    }

    private draw() {
        this.stage.batchDraw();
    }

    /**
     * Set up a performance oriented konva layer system.
     * @param element angular2 html5 element reference.
     */
    constructor(element: ElementRef) {
        this.stage = new Konva.Stage({
            container: element.nativeElement,
            width: 500,
            height: 500
        });
        this.nodes = new Konva.Layer({
            clearBeforeDraw: true,
            name: 'nodes'
        });
        // high scale leads to performance problems!
        this.nodes.disableHitGraph();
        this.stage.add(this.nodes);
        this.camera = new KonvaCamera(this.stage);
        this.render = new KonvaRenderer();
    }
}

/**
 * The canvas component.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'canvas-view',
    directives: [GridLayer, BorderLayer, NodeLayer, Breadcrumbs],
    template: require('./canvas.html'),
    styles: [require('./canvas.scss')]
})
export class Canvas implements AfterViewInit {

    get camera(): Camera {
        return this._camera;
    }

    get inertiaDecay(): number {
        return this._inertiaDecay;
    }

    set inertiaDecay(value: number) {
        this._inertiaDecay = (value < 0) ? 0.01 : (value > 0.999) ? 0.99 : value;
    }

    get zoomPanPreference(): number {
        return this._zoomPan;
    }

    set zoomPanPreference(value: number) {
        this._zoomPan = (value < 0) ? 0.01 : (value > 2) ? 2.0 : value;
    }

    get navigationVelocity(): number {
        return this._velocity;
    }

    model(group: ViewGroup) {
        this._nodeLayer.setModel(group);
    }

    /**
     * Set the navigation velocity.
     * @param value A value between 0.01 and 3.0
     */
    set navigationVelocity(value: number) {
        this._velocity = (value < 0) ? 0.01 : (value > 3.0) ? 3.0 : value;
    }

    @ViewChild(BorderLayer) private _borderLayer: BorderLayer;
    @ViewChild(GridLayer) private _gridLayer: GridLayer;
    @ViewChild(NodeLayer) private _nodeLayer: NodeLayer;

    private _element: ElementRef;
    private _camera: Camera;
    private _behavior: Behavior;
    private _inertiaDecay: number = 0.05;
    private _zoomPan: number = 2.33;
    private _velocity: number = 1.4;
    private _layers: HTMLElement;

    /**
     * On click event handler.
     * @param event
     */
    onClick(event: MouseEvent) {
        let off = this.getOffset(event);
        this._behavior.handleClick(off.x, off.y);
        HTML.block(event);
    }

    /**
     * Handle mouse wheel event.
     * @param event
     */
    onScroll(event: MouseWheelEvent) {
        let off = this.getOffset(event);
        let sca = HTML.normalizeWheel(event);
        this._behavior.handleZoom(off.x, off.y, -sca.spinY*20);
        HTML.block(event);
    }

    /**
     * Handle resize events.
     */
    onResize() {
        const rect = this._layers.getBoundingClientRect();
        this._camera.updateVisual(0, 0, rect.width, rect.height);
    }

    /**
     *
     * @param event
     */
    onMouseDown(event: MouseEvent) {
        const pos = this.getOffset(event);
        this._behavior.startDrag(pos.x, pos.y);
        HTML.block(event);
    }

    /**
     * Mouse movement.
     * @param event
     */
    onMouseMove(event: MouseEvent) {
        const pos = this.getOffset(event);
        this._behavior.handleDrag(pos.x,pos.y);
        HTML.block(event);
    }

    /**
     * Mouse upFrom event.
     */
    onMouseUp(event: MouseEvent) {
        this._behavior.stopDrag();
        HTML.block(event);
    }

    ngAfterViewInit() {
        this._layers = document.getElementById('diagram-canvas');
        this._camera = this._nodeLayer.retrievePlatformCamera();
        this._behavior = new Behavior(this, this._camera);
        this._borderLayer.observe(this._camera);
        this._gridLayer.observe(this._camera);
        this._nodeLayer.observe(this._camera);
        this.onResize();
    }

    private getOffset(event: MouseEvent): any {
        let offset = HTML.elementPosition(this._layers);
        return {
            x: event.pageX - offset.x,
            y: event.pageY - offset.y
        };
    }

    constructor(element:ElementRef) {
        this._element = element;
    }
}

/**
 * Canvas behavior specification.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
class Behavior {
    private kinetics: Kinetics;
    private anchorX = 0.0;
    private anchorY = 0.0;
    private pressedX = 0.0;
    private pressedY = 0.0;
    private panning = false;
    private animating = false;
    private rightLimit = +5000.0;
    private leftLimit = -5000.0;
    private topLimit = -5000.0;
    private botLimit = +5000.0;
    private pathFactor = 1000;
    private offLeft = false;
    private offRight = false;
    private offBottom = false;
    private offTop = false;
    private frames = 60;
    private maxZoom = 10;
    private animation: Interpolator;
    private doKinetics = false;
    private doBanding = false;
    private doLimits = false;
    private current: ViewGroup;
    private groups: Array<ViewGroup> = [];
    private renderer: IViewModelRenderer<any,any>;

    /**
     * Handle the scroll event.
     * @param x
     * @param y
     * @param units
     */
    handleZoom(x: number, y: number, units: number) {
        this.reset();
        let zoom = this.camera.scale;
        let factor = Math.pow(1.002, units);
        let target = factor * zoom;

        if (!this.detectAndDoSwitch()) {
            if (this.doLimits) {
                if (target>= this.maxZoom) {
                    target = this.maxZoom;
                } else {
                    const w = this.camera.visualWidth;
                    const h = this.camera.visualHeight;
                    const l = this.rightLimit - this.leftLimit;
                    const d = this.botLimit - this.topLimit;
                    const limit = (w > h) ? w / l : h / d;
                    target = (target <= limit) ? limit : target;
                }
            }

            this.camera.zoomToAbout(target,
                this.camera.castRayX(x),
                this.camera.castRayY(y)
            );
        }
    }

    /**
     * Handle double click.
     */
    handleClick(x: number, y: number) {
        this.reset();
        const wX = this.camera.castRayX(x);
        const wY = this.camera.castRayY(y);
        this.navigateTo(wX, wY, 1000.0);
    }

    /**
     * Handle drag start.
     * @param x
     * @param y
     */
    startDrag(x: number, y: number) {
        this.reset();
        this.panning = true;
        this.pressedX = x;
        this.pressedY = y;
        this.anchorX = this.camera.cameraX;
        this.anchorY = this.camera.cameraY;
    }

    /**
     * Handle a continuing drag event.
     * @param x
     * @param y
     */
    handleDrag(x: number, y: number) {
        if (!this.panning) return;

        let dragX = this.pressedX - this.anchorX - x;
        let dragY = this.pressedY - this.anchorY - y;

        if (this.doLimits) {
            dragX = this.handleHorizontalConstraints(dragX);
            dragY = this.handleVerticalConstraints(dragY);
        }

        if (this.doKinetics) {
            this.kinetics.update(dragX, dragY);
        }

        this.camera.moveTo(dragX, dragY);
    }

    /**
     * Finish the current dragging state.
     */
    stopDrag() {
        const isKinetic = this.doKinetics &&
             this.kinetics.hasEnoughMomentum();
        const isRubbing = this.doBanding &&
            (this.offLeft || this.offRight ||
             this.offBottom || this.offTop);

        if (isKinetic && !isRubbing) {
            this.throwCamera(
                this.kinetics.speed,
                this.kinetics.angle,
                this.canvas.inertiaDecay
            );
        }

        if (isRubbing) {
            this.handleOffLimitSetback();
        }

        this.panning = false;
    }

    /*
     * Modify the dragged position according to the damping applied at the border.
     */
    private handleHorizontalConstraints(dragX: number): number {
        const cameraMin = this.camera.worldX;
        const cameraWid = this.camera.projectedWidth;
        const cameraZoom = this.camera.scale;
        const cameraMax = cameraMin + cameraWid;

        if (cameraMax >= this.rightLimit) {
            if (this.doBanding) {
                this.offRight = true;
                const drag = dragX / cameraZoom + cameraWid;
                const factor = this.damp(drag, this.rightLimit);
                const offset = this.rightLimit * factor - cameraWid;
                return offset * cameraZoom;
            } else {
                return this.rightLimit;
            }
        } else {
            this.offRight = false;
        }

        if (cameraMin <= this.leftLimit) {
            if (this.doBanding) {
                this.offLeft = true;
                const drag = dragX / cameraZoom;
                const factor = this.damp(drag, this.leftLimit);
                const offset = this.leftLimit * factor;
                return offset * cameraZoom;
            } else {
                return this.leftLimit
            }
        } else {
            this.offLeft = false;
        }

        return dragX;
    }

    /*
     * Modify the dragged position according to the damping applied at the border.
     */
    private handleVerticalConstraints(dragY: number): number {
        const cM = this.camera.worldY;
        const cH = this.camera.projectedHeight;
        const cZ = this.camera.scale;
        const cMax = cM + cH;

        if (cMax >= this.botLimit) {
            if (this.doBanding) {
                this.offBottom = true;
                const drag = dragY / cZ + cH;
                const factor = this.damp(drag, this.botLimit);
                const offset = this.botLimit * factor - cH;
                return offset * cZ;
            } else {
                return this.botLimit;
            }

        } else {
            this.offBottom = false;
        }

        if (cM <= this.topLimit) {
            if (this.doBanding) {
                this.offTop = true;
                const factor = this.damp(dragY / cZ, this.topLimit);
                const offset = this.topLimit * factor;
                return offset * cZ;
            } else {
                return this.topLimit;
            }
        } else {
            this.offTop = false;
        }

        return dragY;
    }

    /*
     * Calculate damping factor.
     */
    private damp(violation: number, limit: number): number {
        return 1.0 + Math.log10(Math.abs(violation / limit));
    }

    /*
     * Reset the camera to a valid position.
     */
    private handleOffLimitSetback() {
        const ca = this.camera;
        const wX = ca.worldX;
        const wY = ca.worldY;
        const pW = ca.projectedWidth;
        const pH = ca.projectedHeight;
        const wW = wX + pW;
        const wH = wY + pH;
        const dx = (this.offLeft) ? wX - this.leftLimit: (this.offRight) ? wW - this.rightLimit: 0;
        const dy = (this.offTop) ? wY - this.topLimit: (this.offBottom) ? wH - this.botLimit: 0;
        const tX = wX + pW / 2 - dx;
        const tY = wY + pH / 2 - dy;
        this.camera.moveTo(tX, tY);
    }

    /**
     * Switches the reference level to the parent level.
     * If no parent is present, nothing will be done and the
     * camera stays the same.
     */
    private ascend() {
        if (!this.isRoot()) {
            let parent = this.getParent();
            let current = this.current;

            let wX = this.camera.worldX;
            let wY = this.camera.worldY;
            let cS = this.camera.scale;
            let rS = cS / parent.scale;
            let rX = (wX + current.left) * cS;
            let rY = (wY + current.top) * cS;
            this.loadLevel(parent);
            this.camera.zoomAndMoveTo(rX, rY, rS);
        }
    }

    /**
     * Switches downTo from the reference level to the child level.
     * If the given level is not a child of the current one, nothing
     * will be done.
     * @param target
     */
    private descendInto(target: ViewGroup) {
        let current = this.current;
        if (target && current && target.parent === current) {
            let wX = this.camera.worldX;
            let wY = this.camera.worldY;
            let cS = this.camera.scale;
            let rX = (wX - target.left * current.scale) * cS;
            let rY = (wY - target.top * current.scale) * cS;
            let rS = (cS * current.scale);

            this.loadLevel(target);
            this.camera.zoomAndMoveTo(rX, rY, rS);
        }
    }

    /**
     * TODO rendering
     * TODO proxies
     * @param level
     */
    private loadLevel(level: ViewGroup) {
        let renderer = this.renderer;
        renderer.renderGroup(level, true);

        // first level
        this.groups = [];
        for (let i = 0, contents = level.contents, len = contents.length; i < len; i++) {
            let item = contents[i];
            if (item instanceof ViewGroup) {
                this.groups.push(item);
                this.renderer.renderGroup(item, false);

                // second level
                if (item.contents) {
                    item.contents.forEach(it => {
                        if (it instanceof ViewGroup) {
                            this.renderer.renderGroup(it, false);
                        } else {
                            this.renderer.renderItem(it);
                        }
                        this.renderer.attach(it, item);
                    })
                }
            } else {
                this.renderer.renderItem(item);
            }
            renderer.attach(item, level);
        }

        this.current = level;
        this.canvas.model(level);
        this.adjustLimits(level);
    }

    private adjustLimits(level: ViewGroup) {
        const widthSpan = 0.9 * level.width;
        const heightSpan = 0.9 * level.height;
        this.leftLimit = -widthSpan;
        this.topLimit = -heightSpan;
        this.botLimit = level.height + heightSpan;
        this.rightLimit = level.width + widthSpan;
    }

    /*
     * TODO make this really fast!
     *  - Check content
     *  - Acceleration structures, adaptive with item sizes
     *  - Only check visible objects of interest
     */
    private detectAndDoSwitch(): boolean {
        if (!this.current) return false;

        if (!this.isRoot()) {
            if (this.isOutsideParent()) {
                this.ascend();
                return true;
            }
        }

        // check each child group
        if (!this.groups) return false;
        let len = this.groups.length;
        for (let i = 0; i < len; i++) {
            let group = this.groups[i];
            if (this.isWithinChildGroup(group)) {
                this.descendInto(group);
                return true;
            }
        }

        return false;
    }

    private isRoot(): boolean {
        return (!this.current.parent);
    }

    private getParent(): ViewGroup {
        return this.current.parent as ViewGroup;
    }

    private isWithinChildGroup(group: ViewGroup): boolean {
        let scale = this.current.scale;
        let cam = this.camera;
        let pW = cam.projectedWidth;
        let pH = cam.projectedHeight;
        let wX = cam.worldX;
        let wY = cam.worldY;
        let gX = group.left * scale;
        let gY = group.top * scale;
        let gW = group.width * scale;
        let gH = group.height * scale;
        return (wX >= gX &&
                wY >= gY &&
                wX + pW <= gX + gW &&
                wY + pH <= gH + gY);
    }

    private isOutsideParent(): boolean {
        let parent = this.getParent();
        let driftW = parent.width * 0.6;
        let driftH = parent.height * 0.6;
        return (this.camera.worldX < parent.left - driftW &&
                this.camera.worldY < parent.top - driftH &&
                this.camera.projectedWidth > parent.width + driftW &&
                this.camera.projectedHeight > parent.height + driftH);
    }

    private static createDebugModel(): ViewGroup {
        /*
        let root = new ViewGroup('ROOT', 0, 0, 1000, 1000, .1);
        let first = new ViewGroup('FIRST', 5000, 5000, 5000, 5000, .1);
        let item = new ViewItem('ITEM1', 25000, 25000, 2500, 2500);
        */

        let i = 40;
        let o : ViewGroup = null;
        let root: ViewGroup = null;
        while (i--) {
            let item = new ViewGroup(i.toFixed(1), 2000, 2000, 2000, 2000, 0.1);
            if (o) {
                o.addContent(item);
            } else {
                root = item;
            }
            o = item;
        }

        return root;
    }

    private throwCamera(speed: number, angle: number, decay: number) {
        const cam = this.camera;
        const time = -(1000.0 / this.frames) / Math.log(1.0 - decay);
        const rate = 1.0 / (1.0 - decay);
        const dist = speed * time / 4;
        const distX = dist * Math.cos(angle);
        const distY = dist * Math.sin(angle);
        this.play(new Interpolator(frac => {
            const f = 1 - Math.exp(-rate * frac);
            const posX = cam.cameraX + f * distX;
            const posY = cam.cameraY + f * distY;
            cam.moveTo(-posX, -posY);
        }, time));
    }

    /*
     * Navigate to the given center coordinates.
     */
    private navigateTo(centerX: number, centerY: number, targetWidth: number) {
        const z = this.canvas.zoomPanPreference;
        const v = this.canvas.navigationVelocity;
        const camera = this.camera;
        const aW = camera.projectedWidth;
        const aX = camera.centerX;
        const aY = camera.centerY;
        const eW = targetWidth;
        const dX = centerX - aX;
        const dY = centerY - aY;
        const dU = Math.hypot(dX, dY);

        if (dU < 1e-8) {
            const S = Math.log(eW/aW) / Math.SQRT2;
            this.play(new Interpolator(f => {
                const tW = aW * Math.exp(Math.SQRT2 * f * S);
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
            }, Math.sqrt(1 + S) * this.pathFactor / v));
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
            this.play(new Interpolator(f => {
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
            }, Math.sqrt(1 + S) * this.pathFactor / v));
        }
    }

    private play(animation: Interpolator) {
        this.stopAnimation();
        this.animating = true;
        this.animation = animation;
        this.animation.play();
    }

    private reset() {
        this.panning = false;
        this.stopAnimation();
        this.kinetics.reset();
    }

    private stopAnimation() {
        if (this.animation) {
            this.animation.stop();
            this.animation = undefined;
        }
        this.animating = false;
    }
    
    constructor(private canvas: Canvas, private camera: Camera) {
        this.kinetics = new Kinetics();
        this.renderer = new KonvaRenderer();
        this.loadLevel(Behavior.createDebugModel())
    }
}

/**
 * Interpolator helper class, which encapsulates
 * requestAnimationFrame and onFinished callbacks.
 * @author Martin Schade
 * @since 1.0.0
 */
class Interpolator {
    private start: number;
    private active = false;
    private onFinished: () => void;
    private frame: number;

    stop() {
        if (this.frame) window.cancelAnimationFrame(this.frame);
        this.frame = undefined;
        this.active = false;
        this.update = undefined;
    }

    play() {
        if (this.active) return;
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

    constructor(private update: (f: number) => void,
                private duration: number) {
    }
}

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
class Kinetics {

    get smoothness(): number { return this._smooth; }

    set smoothness(s: number) { this._smooth = (s < 0) ? 0 : (s > 1) ? 1 : s; }

    get speed(): number { return this._speed; }

    get angle(): number { return this._angle; }

    minimumDelay = 66; // ms

    private _speed = 0.0;
    private _angle = 0.0;
    private _smooth = 0.8;
    private _lastX = 0.0;
    private _lastY = 0.0;
    private _lastT = 0.0;
    private _deltaX = 0.0;
    private _deltaY = 0.0;

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
            this._deltaX = (1 - s) * vx + s * this._deltaX;
            this._deltaY = (1 - s) * vy + s * this._deltaY;
            this._angle = Math.atan2(this._deltaY, this._deltaX);
            this._speed = Math.hypot(this._deltaX, this._deltaY);
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
        if (!this._lastT) return false;
        if (this._speed <= 0) return false;
        const minLimit = Date.now() - this.minimumDelay;
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
        this._deltaX = 0.0;
        this._deltaY = 0.0;
    }
}

/**
 * Helper class for handling html elements.
 */
class HTML {

    static PIXEL_STEP = 10;
    static LINE_HEIGHT = 40;
    static PAGE_HEIGHT = 800;

    /**
     * Normalize wheel values across browsers.
     */
    static normalizeWheel(event: any): any {

        let sX = 0, sY = 0;    // pixelX, pixelY

        if ('detail' in event) {
            sY = event.detail;
        }
        if ('wheelDelta' in event) {
            sY = -event.wheelDelta / 120;
        }
        if ('wheelDeltaY' in event) {
            sY = -event.wheelDeltaY / 120;
        }
        if ('wheelDeltaX' in event) {
            sX = -event.wheelDeltaX / 120;
        }

        if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
            sX = sY;
            sY = 0;
        }

        let pX = sX * this.PIXEL_STEP;
        let pY = sY * this.PIXEL_STEP;

        if ('deltaY' in event) {
            pY = event.deltaY;
        }
        if ('deltaX' in event) {
            pX = event.deltaX;
        }

        if ((pX || pY) && event.deltaMode) {
            if (event.deltaMode === 1.0) {
                pX *= this.LINE_HEIGHT;
                pY *= this.LINE_HEIGHT;
            } else {
                pX *= this.PAGE_HEIGHT;
                pY *= this.PAGE_HEIGHT;
            }
        }

        if (pX && !sX) {
            sX = (pX < 1) ? -1 : 1;
        }
        if (pY && !sY) {
            sY = (pY < 1) ? -1 : 1;
        }

        return { spinX: sX, spinY: sY, pixelX: pX, pixelY: pY };
    }

    /**
     * Determines the relative position of the element.
     */
    static elementPosition(element: HTMLElement) {
        let x = 0, y = 0;
        let inner = true;
        let e = element;
        do {
            x += e.offsetLeft;
            y += e.offsetTop;
            let style = getComputedStyle(e, null);
            let borderTop = HTML.parseStyle(style, 'border-top-width');
            let borderLeft = HTML.parseStyle(style, 'border-left-width');
            y += borderTop;
            x += borderLeft;
            if (inner) {
                let paddingTop = HTML.parseStyle(style, 'padding-top');
                let paddingLeft = HTML.parseStyle(style, 'padding-left');
                y += paddingTop;
                x += paddingLeft;
            }
            inner = false;
            e = e.offsetParent as HTMLElement;
        } while (e);
        return {
            x: x,
            y: y
        };
    }


    /**
     * Parses a numeric style property.
     */
    static parseStyle(style: any, prop: string): number {
        return parseInt(style.getPropertyValue(prop), 10);
    }

    /**
     * Stop propagation and prevent default action.
     * @param event
     */
    static block(event: any) {
        event.stopPropagation();
        event.preventDefault();
    }
}
