/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {Component, ElementRef, ViewChild, AfterViewInit, Inject} from '@angular/core';
import {Camera} from "../../common/camera";
import {PlatformService} from "../../services/platforms";
import {ViewGroup, ViewItem} from "../../common/viewmodel";
import {IPlatformLayer} from "../../common/renderer";
import Grid from '../../common/grid';
import Border from '../../common/border';
import NavigationBar from "../navigation/navigationbar";
import HTML from "../../common/html";
import Kinetics from "../../common/kinetic";

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
 * The canvas component.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'canvas-view',
    directives: [GridLayer, BorderLayer, NavigationBar],
    template: require('./canvas.html'),
    styles: [require('./canvas.scss')]
})
export class Canvas implements AfterViewInit {
    private _platformProvider: PlatformService;
    private _platform: IPlatformLayer;

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
        if (this._platform) this._platform.setModel(group);
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
    @ViewChild('nodeLayer') private _nodeLayer: ElementRef;
    @ViewChild(NavigationBar) private _navigation: NavigationBar;

    private _element: ElementRef;
    private _camera: Camera;
    private _behavior: CanvasBehavior;
    private _inertiaDecay: number = 0.05;
    private _zoomPan: number = 2.33;
    private _velocity: number = 1.4;
    private _diagram: HTMLElement;

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
        const rect = this._diagram.getBoundingClientRect();
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

    /**
     * Assemble all canvas layers.
     */
    ngAfterViewInit() {
        /* get html elements */
        this._diagram = document.getElementById('diagram-canvas');
        this._platform = this._platformProvider.getPlatform(this._nodeLayer.nativeElement);

        /* link behavior state machine*/
        if (this._platform) this._camera = this._platform.getCamera();
        if (this._camera) this._behavior = new CanvasBehavior(this, this._camera, this._platform);

        if (this._behavior) {
            /* attach all layers */
            if (this._navigation) this._behavior.pushTo(this._navigation);
            if (this._borderLayer) this._borderLayer.observe(this._camera);
            if (this._gridLayer) this._gridLayer.observe(this._camera);
            if (this._nodeLayer) this._camera.attachObserver(this._platform);
        } else throw new Error('Could not create behavior class for canvas');
        
        this.onResize();
        this.camera.zoomAndMoveTo(-250, -150, 0.2);
    }

    private getOffset(event: MouseEvent): any {
        let offset = HTML.elementPosition(this._diagram);
        return {
            x: event.pageX - offset.x,
            y: event.pageY - offset.y
        };
    }

    constructor(@Inject(PlatformService) service: PlatformService,
                @Inject(ElementRef) private element:ElementRef) {
        this._element = element;
        this._platformProvider = service;
    }
}

/**
 * Canvas behavior specification.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
class CanvasBehavior {
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
    private _navi: NavigationBar;

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

    pushTo(crumbs: NavigationBar) {
        this._navi = crumbs;
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
        ca.moveTo(tX, tY);
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
     * Render the given viewmodel.
     * TODO rendering
     * TODO proxies
     * TODO caching, reuse previous elements
     * TODO accelerate
     * TODO event emitting
     * TODO move level rendering away from UI
     * TODO dynamic descent based on LOD-area
     * @param level
     */
    private loadLevel(level: ViewGroup) {
        if (this._navi) this._navi.setPath(level);
        this.platform.setModel(level);
        this.current = level;
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

        let groups = this.platform.cachedGroups;
        // check each child group
        if (!groups) return false;
        let len = groups.length;
        for (let i = 0; i < len; i++) {
            let group = groups[i];
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
        let adjust = 0.6;
        let driftW = parent.width * adjust;
        let driftH = parent.height * adjust;
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
            let group = new ViewGroup(`Level ${40 - i}`, 2000, 2000, 2000, 2000, 0.1);
            let j = 120;
            while (j) {
                let x = Math.random() * 18000;
                let y = Math.random() * 18000;
                let item = new ViewItem('Item', x, y, 192, 108)
                group.addContent(item);
                j--;
            }
            if (o) {
                o.addContent(group);
            } else {
                root = group;
            }
            o = group;
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
    
    constructor(private canvas: Canvas, private camera: Camera, private platform: IPlatformLayer) {
        this.kinetics = new Kinetics();
        this.loadLevel(CanvasBehavior.createDebugModel())
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
