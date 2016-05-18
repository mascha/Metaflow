import {Component, ElementRef, ViewChild, AfterViewInit, Inject, HostListener} from '@angular/core';
import {Camera} from "../../common/camera";
import {ViewGroup} from "../../common/viewmodel";
import {PlatformService} from "../../services/platforms";
import {PlatformLayer} from "../../common/platform";
import Grid from '../../common/grid';
import Border from '../../common/border';
import NavigationBar from "../breadcrumbs/breadcrumbs";
import HTML from "../../common/html";
import ModelService from "../../services/models";
import {DiagramEvents, StateMachine, DiagramState} from "../../common/diagrams";

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

    update(group:ViewGroup) {
        if (this._border) {
            this._border.updateProxies(group);
        }
    }
}

/**
 * Grid layer component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'node-layer',
    template: '<canvas #nodeLayer class="layer"></canvas>'
})
class NodeLayer {
    @ViewChild('nodeLayer')
    private _element: ElementRef;

    getElement(): HTMLCanvasElement {
        return this._element.nativeElement;
    }
}

/**
 * The canvas component.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'diagram',
    directives: [GridLayer, NodeLayer, BorderLayer, NavigationBar],
    template: require('./canvas.html'),
    styles: [require('./canvas.scss')]
})
export default class Diagram implements AfterViewInit {
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

    set model(group: ViewGroup) {
        this._model = group;
        if (this._platform) {
            this._platform.setModel(group);
        }
        if (this._borderLayer) {
            this._borderLayer.update(group);
        }
    }

    get model(): ViewGroup {
        return this._model;
    }

    set navigationVelocity(value: number) {
        this._velocity = (value < 0) ? 0.01 : (value > 3.0) ? 3.0 : value;
    }

    animatedZoom = false;
    animatedNavigation = true;
    frames = 60;
    pathFactor = 1000;
    doBanding = false;
    limitMovement = false;
    useKinetics = false;

    /* Layers and children */

    @ViewChild(BorderLayer) private _borderLayer: BorderLayer;
    @ViewChild(GridLayer) private _gridLayer: GridLayer;
    @ViewChild(NodeLayer) private _nodeLayer: NodeLayer;

    private _element: ElementRef;
    private _camera: Camera;
    private _behavior: StateMachine;
    private _inertiaDecay: number = 0.05;
    private _zoomPan: number = 2.33;
    private _velocity: number = 1.4;
    private _diagram: HTMLElement;
    private _model: ViewGroup;
    private _platformProvider: PlatformService;
    private _platform: PlatformLayer;

    /**
     * On click event handler.
     * @param event
     */
    @HostListener('dblclick', ['$event'])
    onDoubleClick(event: MouseEvent) {
        let off = HTML.getOffset(this._diagram, event);
        this._behavior.handleClick(off.x, off.y, true);
        return false;
    }

    /**
     * On click event handler.
     * @param event
     */
    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        let off = HTML.getOffset(this._diagram, event);
        this._behavior.handleClick(off.x, off.y, false);
        return false;
    }

    /**
     * Keyboard event handler.
     * @param event
     */
    @HostListener('keyup', ['$event'])
    onKeyUp(event: KeyboardEvent) {
        this._behavior.handleKey(event);
        return false;
    }

    /**
     * Handle mouse wheel event.
     * @param event
     */
    @HostListener('wheel', ['$event'])
    onScroll(event: MouseEvent) {
        let off = HTML.getOffset(this._diagram, event);
        let sca = HTML.normalizeWheel(event);
        this._behavior.handleZoom(off.x, off.y, -sca*20);
        return false;
    }

    /**
     * Handle resize events.
     */
    @HostListener('window:resize') onResize() {
        const rect = this._diagram.getBoundingClientRect();
        this._camera.updateVisual(0, 0, rect.width, rect.height);
    }

    /**
     *
     * @param event
     */
    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        const pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseDown(pos.x, pos.y);
        HTML.block(event);
    }

    /**
     * Mouse movement.
     * @param event
     */
    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        const pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseMove(pos.x,pos.y);
        return false;
    }

    /**
     * Mouse up event.
     * @param event
     */
    @HostListener('mouseup', ['$event'])
    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        const pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseUp(pos.x, pos.y);
        return false;
    }

    /**
     * Assemble all canvas layers.
     */
    ngAfterViewInit() {
        /* get html elements */
        this._diagram = this._element.nativeElement; //document.getElementById('diagram-canvas');
        let surface = this._nodeLayer.getElement();

        /* retrieve rendering platform */
        this._platform = this._platformProvider.getPlatform(surface);

        /* link behavior state machine*/
        if (this._platform) {
            this._camera = this._platform.getCamera();
        }
        if (this._camera) {
            this._behavior = new DiagramBehavior(this);
        }

        /* attach all layers */
        if (this._behavior) {
            if (this._borderLayer) {
                this._borderLayer.observe(this._camera);
            }
            if (this._gridLayer) {
                this._gridLayer.observe(this._camera);
            }
            if (this._nodeLayer) {
                this._camera.attachObserver(this._platform);
            }
        } else {
            throw new Error('Could not create behavior class for diagram');
        }
        
        this.onResize();
        this.camera.zoomAndMoveTo(-250, -150, 0.2);
    }
    
    constructor(@Inject(PlatformService) service: PlatformService,
                @Inject(ModelService) models: ModelService,
                @Inject(ElementRef) element: ElementRef) {
        this._model = models.getModel();
        this._element = element;
        this._platformProvider = service;
    }
}

/**
 * The state machine for the diagramming view.
 * @author Martin Schade
 * @since 1.0.0
 */
class DiagramBehavior implements StateMachine {

    private current: DiagramState;
    private states: any;
    
    handleClick(x:number, y:number, double:boolean) {
        this.current.handleClick(x, y, double);
    }

    handleMouseDown(x:number, y:number) {
        this.current.handleMouseDown(x, y);
    }

    handleMouseMove(x:number, y:number) {
        this.current.handleMouseMove(x, y);
    }

    handleMouseUp(x:number, y:number) {
        this.current.handleMouseUp(x, y);
    }

    handleAbort() {
        this.current.handleAbort();
    }

    handleStop() {
        this.current.handleStop();
    }

    handleZoom(x:number, y:number, f:number) {
        this.current.handleZoom(x, y, f);
    }

    handleKey(event:KeyboardEvent) {
        this.current.handleKey(event);
    }

    /**
     * Enter the new state.
     * @param state
     * @param params
     */
    transitionTo(state: string, params?: any) {
        let newState = this.states[state];
        if (newState) {
            if (this.current) {
                this.current.leaveState();
            }
            this.current = newState;
            newState.enterState(params);
        }
    }

    /**
     * 
     */
    reenterState(params?: any) {
        this.current.leaveState();
        this.current.enterState(params)
    }


    /**
     * Assemble state machine.
     * @param diagram Pass-through diagram reference.
     */
    constructor(private diagram: Diagram) {
        this.states = {
            'idle': new Idle(this, diagram),
            'panning': new Panning(this, diagram),
            'animating': new Animating(this, diagram)
        };
        
        this.transitionTo('idle', null);
    }
}

/**
 * Base state which contains reused state data.
 */
abstract class BaseState implements DiagramState {

    /* Limits */
    rightLimit = +5000.0;
    leftLimit = -5000.0;
    topLimit = -5000.0;
    botLimit = +5000.0;

    protected camera: Camera;
    protected current: ViewGroup;

    /**
     * Adjust the pan/zoom limits to the new level.
     * @param level
     */
    private adjustLimits(level: ViewGroup) {
        const widthSpan = 0.9 * level.width;
        const heightSpan = 0.9 * level.height;
        this.leftLimit = -widthSpan;
        this.topLimit = -heightSpan;
        this.botLimit = level.height + heightSpan;
        this.rightLimit = level.width + widthSpan;
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
        this.current = level;
        this.diagram.model = level;
        this.adjustLimits(level);
    }

    /*
     * TODO make this really fast!
     *  - Check content
     *  - Acceleration structures, adaptive with item sizes
     *  - Only check visible objects of interest
     */
    protected detectAndDoSwitch(): boolean {
        if (!this.current) return false;

        if (!this.isRoot()) {
            if (this.isOutsideParent()) {
                this.ascend();
                return true;
            }
        }

        let groups = this.diagram.model.contents;
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
        let pW = cam.projWidth;
        let pH = cam.projHeight;
        let wX = cam.worldX;
        let wY = cam.worldY;
        let gX = group.left * scale;
        let gY = group.top * scale;
        let gW = group.width * scale;
        let gH = group.height * scale;
        return (wX >= gX && wY >= gY &&
                wX + pW <= gX + gW &&
                wY + pH <= gH + gY);
    }

    private isOutsideParent(): boolean {
        let parent = this.getParent();
        let cam = this.camera;
        let adjust = 0.6;
        let driftH = parent.width * adjust;
        let driftV = parent.height * adjust;
        return (cam.worldX < parent.left - driftH &&
                cam.worldY < parent.top - driftV &&
                cam.projWidth > parent.width + driftH &&
                cam.projHeight > parent.height + driftV);
    }

    enterState(params?: any) {}

    leaveState() {}

    handleClick(x:number, y:number, double:boolean) {}

    handleMouseDown(x:number, y:number) {}

    handleMouseMove(x:number, y:number) {}

    handleMouseUp(x:number, y:number) {}

    handleZoom(x:number, y:number, f:number) {}

    handleKey(event:KeyboardEvent) {}

    handleAbort() {}

    handleStop() {}

    constructor(
        protected machine: DiagramBehavior,
        protected diagram: Diagram) {
        this.camera = diagram.camera;
    }
}

/**
 * Idle state.
 *  TODO hover effect
 *  TODO connection hover effect
 *  TODO click, the show info
 *  TODO border preview
 *  TODO border hover effect
 *  TODO lensing (?)
 */
class Idle extends BaseState {

    handleZoom(x: number, y: number, units: number) {
        let zoom = this.camera.scale;
        let factor = Math.pow(1.002, units);
        let target = factor * zoom;

        if (!this.detectAndDoSwitch()) {
            if (this.diagram.limitMovement) {
                let maxZoom = this.maxZoom;
                if (target>= maxZoom) {
                    target = maxZoom;
                } else {
                    const limits = this;
                    const w = this.camera.visualWidth;
                    const h = this.camera.visualHeight;
                    const l = limits.rightLimit - limits.leftLimit;
                    const d = limits.botLimit - limits.topLimit;
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
}

/**
 * Panning state.
 *  TODO drag vs pan vs connect vs
 *  TODO kinetics
 *  TODO banding
 *  TODO limit changing on level switch
 */
class Panning extends BaseState {

    protected offLeft = false;
    protected offRight = false;
    protected offBottom = false;
    protected offTop = false;
    protected anchorX = 0.0;
    protected anchorY = 0.0;
    protected pressedX = 0.0;
    protected pressedY = 0.0;
    protected kinetics: Kinetics;

    enterState() {
        if (!this.kinetics) {
            this.kinetics = new Kinetics();
        }
    }

    leaveState() {
        this.kinetics.reset();
        this.anchorX = 0.0;
        this.anchorY = 0.0;
        this.pressedX = 0.0;
        this.pressedY = 0.0;
        this.offLeft = false;
        this.offRight = false;
        this.offBottom = false;
        this.offTop = false;
    }

    /**
     * Handle drag start.
     * @param x
     * @param y
     */
    handleMouseDown(x: number, y: number) {
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
    handleMouseMove(x: number, y: number) {
        let dragX = this.pressedX - this.anchorX - x;
        let dragY = this.pressedY - this.anchorY - y;

        if (this.diagram.limitMovement) {
            dragX = this.handleHorizontalConstraints(dragX);
            dragY = this.handleVerticalConstraints(dragY);
        }

        if (this.diagram.useKinetics) {
            this.kinetics.update(dragX, dragY);
        }

        this.camera.moveTo(dragX, dragY);
    }

    private isBanding(): boolean {
        return (this.diagram.doBanding && (this.offLeft || this.offRight || this.offBottom || this.offTop));
    }

    private isKinetic(): boolean {
        return (this.diagram.useKinetics && this.kinetics.hasEnoughMomentum());
    }

    /**
     * Finish the current dragging state.
     */
    handleMouseUp(x: number, y: number) {
        const isKinetic = this.isKinetic();
        const isRubbing = this.isBanding();

        if (isKinetic && !isRubbing) {
            let anim = Interpolator.throwCamera({
                speed: this.kinetics.speed,
                angle: this.kinetics.angle,
                decay: this.diagram.inertiaDecay
            });

            this.transitionTo('animating', {
                forced: true, interpolator: anim
            })
        }

        if (isRubbing) {
            this.handleOffLimitSetback();
        }
    }

    /*
     * Modify the dragged position according to the damping applied at the border.
     */
    private handleHorizontalConstraints(dragX: number): number {
        const cameraMin = this.camera.worldX;
        const cameraWid = this.camera.projWidth;
        const cameraZoom = this.camera.scale;
        const cameraMax = cameraMin + cameraWid;

        if (cameraMax >= this.rightLimit) {
            if (this.diagram.doBanding) {
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
            if (this.diagram.doBanding) {
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
        const cH = this.camera.projHeight;
        const cZ = this.camera.scale;
        const cMax = cM + cH;

        if (cMax >= this.botLimit) {
            if (this.diagram.doBanding) {
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
            if (this.diagram.doBanding) {
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
        const pW = ca.projWidth;
        const pH = ca.projHeight;
        const wW = wX + pW;
        const wH = wY + pH;
        const dx = (this.offLeft) ? wX - this.leftLimit:
                   (this.offRight) ? wW - this.rightLimit: 0;
        const dy = (this.offTop) ? wY - this.topLimit:
                   (this.offBottom) ? wH - this.botLimit: 0;
        const tX = wX + pW / 2 - dx;
        const tY = wY + pH / 2 - dy;
        ca.moveTo(tX, tY);
    }
}

/**
 * Animation state
 *  TODO handle abort
 *  TODO handle cancel
 *  TODO interaction with banding
 *  TODO forced animation
 */
class Animating extends BaseState {

    private forceAnimation = false;
    private animation: Interpolator;

    enterState(params: any) {
        this.forceAnimation = params.forced || false;
        this.animation = params.interpolator;
        this.animation.play();
    }

    leaveState() {
        if (this.animation) {
            this.animation.stop();
            this.animation = undefined;
        }
    }
}

/**
 * Paint-like state.
 *  TODO startDrawing event
 *  TODO connect with palette
 *  TODO connect with editor
 *  TODO visual preview
 */
class Drawing extends Panning {

}

/**
 * Node drag state.
 *  TODO singular drag
 *  TODO multiple drag
 *  TODO node effect on possible drag
 */
class Dragging extends Panning {

}

/**
 * Edge drag state.
 *  TODO edge drag
 *  TODO visual connection effect
 */
class Connecting extends Panning {

}

/**
 * Property editing state.
 *  TODO edit detection
 *  TODO input overlay (else ?)
 */
class Editing extends BaseState {

}

/**
 * Selection state.
 *  TODO single click
 *  TODO rectangular selection
 *  TODO lasso selection
 *  TODO visual overlay effect
 */
class Selecting extends Panning {

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
        if (this.frame) {
            window.cancelAnimationFrame(this.frame);
        }
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
        return new Interpolator(frac => {
            const f = 1 - Math.exp(-rate * frac);
            const posX = cam.cameraX + f * distX;
            const posY = cam.cameraY + f * distY;
            cam.moveTo(-posX, -posY);
        }, time);
    }

    /**
     * Navigate to the given center coordinates.
     */
    static navigateTo(params: any): Interpolator {
        const z = params.canvas.zoomPanPreference;
        const v = params.canvas.navigationVelocity;
        const camera = params.camera;
        const aW = camera.projWidth;
        const aX = camera.centerX;
        const aY = camera.centerY;
        const eW = params.targetWidth;
        const dX = params.centerX - aX;
        const dY = params.centerY - aY;
        const dU = Math.hypot(dX, dY);

        if (dU < 1e-8) {
            const S = Math.log(eW/aW) / Math.SQRT2;
            return new Interpolator(f => {
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
                private duration: number) {}
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
        if (!this._lastT) {
            return false;
        }
        if (this._speed <= 0) {
            return false;
        }
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
