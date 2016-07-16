import {Component, ElementRef, ViewChild, HostListener} from '@angular/core';
import {StateMachine, DiagramState, DiagramEvents} from "../../common/diagrams";
import {Camera} from "../../common/camera";
import {ViewGroup, ViewVertex} from "../../common/viewmodel/viewmodel";
import {PlatformLayer} from "../../common/platform";
import Grid from '../../common/grid';
import Border from '../../common/border';
import HTML from "../../common/utility";
import Kinetics from "../../common/kinetics";
import ModelService from "../../services/models";
import PlatformService from "../../services/platforms";
import Breadcrumbs from "./breadcrumbs/breadcrumbs";
import Overview from "./overview/overview";
import Presenter from "./controls/presenter";

import {Observable} from "rxjs/Rx";

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
    private canvas: ElementRef;
    private grid: Grid;

    observe(camera: Camera) {
        let canvas = this.canvas.nativeElement;
        this.grid = new Grid(camera, canvas);
        camera.attachObserver(this.grid);
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
    private element: ElementRef;
    private border: Border;

    observe(camera: Camera) {
        let canvas = this.element.nativeElement as HTMLCanvasElement;
        this.border = new Border(camera, canvas);
        camera.attachObserver(this.border);
    }

    update(group: ViewGroup) {
        if (this.border) {
            this.border.updateProxies(group);
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
    directives: [
        GridLayer, NodeLayer,
        BorderLayer, Breadcrumbs,
        Presenter, Overview
    ],
    template: require('./diagram.html'),
    styles: [require('./diagram.scss')]
})
export default class Diagram {
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

    get cachedGroups(): Array<ViewGroup> {
        return this._platform.cachedGroups;
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

    private _camera: Camera;
    private _behavior: DiagramEvents;
    private _inertiaDecay: number = 0.05;
    private _zoomPan: number = 2.33;
    private _velocity: number = 1.4;
    private _diagram: HTMLElement;
    private _model: ViewGroup;
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
        this._diagram = this._element.nativeElement;
        let surface = this._nodeLayer.getElement();

        /* retrieve rendering platform */
        if (this._diagram) {
            this._platform = this._platformProvider.getPlatform(surface);
        } else {
            throw new Error('Could not find diagram DOM element');
        }

        /* link behavior state machine*/
        if (this._platform) {
            this._camera = this._platform.getCamera();
        } else {
            throw Error('Could not create rendering platform');
        }

        if (this._camera) {
            this._behavior = new DiagramBehavior(this);
        } else {
            throw new Error('Could not create camera instance');
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
            throw new Error('Could not create diagram controller');
        }

        /* Load level data */
        this.model = this._modelProvider.getModel();

        this.onResize();
        this.camera.zoomAndMoveTo(-250, -150, 0.5);
    }

    constructor(private _platformProvider: PlatformService,
                private _modelProvider: ModelService,
                private _element: ElementRef) {
    }
}

/**
 * The state machine for the diagramming view.
 * Simply delegates all events to the currently active state.
 * @author Martin Schade
 * @since 1.0.0
 */
class DiagramBehavior implements StateMachine, DiagramEvents {

    private current: DiagramState;
    private states: any;
    private debug = false;
    
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

    handleZoom(x:number, y:number, f:number) {
        this.current.handleZoom(x, y, f);
    }

    handleKey(event:KeyboardEvent) {
        this.current.handleKey(event);
    }

    handleAbort() {
        this.current.handleAbort();
    }

    handleStop() {
        this.current.handleStop();
    }

    transitionTo(state: string, params?: any) {
        let newState = this.states[state];
        if (newState) {
            if (this.current) {
                this.current.leaveState();
            }
            this.current = newState;
            newState.enterState(params);
            if (this.debug) {
                console.log('diagram state: ' + state);
            }
        }
    }

    reenterState(params?: any) {
        this.current.leaveState();
        this.current.enterState(params);
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
        /* Initial state */
        this.transitionTo('idle', null);
    }
}

/**
 * Responsible for handling level transition events and detection.
 * @author Martin Schade
 * @since 1.0.0
 */
class ReferenceManager {
    private current: ViewGroup;
}

/**
 * Base state which contains reused state data.
 * @author Martin Schade
 * @since 1.0.0
 */
abstract class BaseState implements DiagramState {

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
        if (!this.current) {
            return false;
        }

        if (!this.isRoot()) {
            if (this.isOutsideParent()) {
                this.ascend();
                return true;
            }
        }

        let groups = this.diagram.cachedGroups;
        console.log(groups);
        if (!groups) {
            return false;
        }
        
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

    protected becomeIdle() {
        this.machine.transitionTo('idle');
    }

    enterState(params?: any) { /* ignore*/ }

    leaveState() { /* ignore*/ }

    handleClick(x: number, y: number, double: boolean) { /* ignore*/ }

    handleMouseDown(x:number, y: number) { /* ignore*/ }

    handleMouseMove(x:number, y: number) { /* ignore*/ }

    handleMouseUp(x: number, y: number) { /* ignore*/ }

    handleZoom(x: number, y: number, f: number) { /* ignore */}

    handleKey(event:KeyboardEvent) { /* ignore */}

    handleAbort() { /* ignore */}

    handleStop() { /* ignore */ }

    constructor(protected machine: DiagramBehavior,
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
 *  TODO lenses (?)
 *  TODO hand off descent detection & level loading to worker
 */
class Idle extends BaseState {
    
    private maxZoom = 10;

    /**
     * TODO detect (drag | pan | draw | select)
     */
    handleMouseDown(x: number, y: number) {
        this.machine.transitionTo('panning', {x: x, y: y});
    }

    handleClick(x: number, y: number, double: boolean) {
        if (double) {
            this.machine.transitionTo('animating', {
                interpolator: Interpolator.navigateTo({
                    centerX: this.camera.castRayX(x),
                    centerY: this.camera.castRayY(y),
                    velocity: this.diagram.navigationVelocity,
                    panZoom: this.diagram.zoomPanPreference,
                    pathFactor: this.diagram.pathFactor,
                    targetWidth: this.getAppropriateScale(),
                    camera: this.camera
                })
            });
        } else {
            /* single click not yet implemented */
        }
    }

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

    /**
     * TODO change target width to level specific width scale.
     */
    private getAppropriateScale(): number {
        return 1000;
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

    enterState(params?: any) {
        if (!this.kinetics) {
            this.kinetics = new Kinetics();
        }
        if (params) {
            this.handleMouseDown(
                params.x || 0,
                params.y || 0
            );
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
    
    handleMouseDown(x: number, y: number) {
        this.pressedX = x;
        this.pressedY = y;
        this.anchorX = this.camera.cameraX;
        this.anchorY = this.camera.cameraY;
    }
    
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

    handleMouseUp(x: number, y: number) {
        const kinetic = this.isKinetic();
        const banding = this.isBanding();

        if (banding) {
            const ca = this.camera;
            const wX = ca.worldX, wW = wX + ca.projWidth;
            const wY = ca.worldY, wH = wY + ca.projHeight;
            const dx = this.horizontalDisplacement(wX, wW);
            const dy = this.verticalDisplacement(wY, wH);

            this.machine.transitionTo('animating', {
                forced: true, interpolator: Interpolator.navigateTo({
                    targetX: wX + ca.projWidth / 2 - dx,
                    targetY: wY + ca.projHeight / 2 - dy
                })
            });
        } else if (kinetic) {
            if (kinetic && !banding) {
                this.machine.transitionTo('animating', {
                    forced: false,
                    interpolator: Interpolator.throwCamera({
                        speed: this.kinetics.speed,
                        angle: this.kinetics.angle,
                        decay: this.diagram.inertiaDecay
                    })
                });
            }
        } else {
            this.machine.transitionTo('idle');
        }
    }
    
    private horizontalDisplacement(wX: number, wW: number): number {
        return (this.offLeft) ? wX - this.leftLimit: (this.offRight) ? wW - this.rightLimit: 0;
    }
    
    private verticalDisplacement(wY: number, wH: number): number {
        return (this.offTop) ? wY - this.topLimit: (this.offBottom) ? wH - this.botLimit: 0;
    }

    private isBanding(): boolean {
        return (this.diagram.doBanding && (this.offLeft || this.offRight || this.offBottom || this.offTop));
    }

    private isKinetic(): boolean {
        return (this.diagram.useKinetics && this.kinetics.hasEnoughMomentum());
    }

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
                return this.leftLimit;
            }
        } else {
            this.offLeft = false;
        }

        return dragX;
    }

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
    
    private damp(actual: number, limit: number): number {
        let ratio = Math.abs(actual / limit);
        return 1 + Math.log10(ratio || 1);
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

    handleZoom(x, y, f) {
        if (!this.forceAnimation) {
            this.becomeIdle();
            this.machine.handleZoom(x, y, f);
        }
    }

    handleMouseDown(x, y) {
        if (!this.forceAnimation) {
            this.machine.transitionTo('panning');
            this.machine.handleMouseDown(x, y);
        }
    }

    handleStop() {
        if (!this.forceAnimation) {
            this.becomeIdle();
        }
    }

    handleAbort() {
        this.becomeIdle();
    }

    leaveState() {
        if (this.animation) {
            this.animation.stop();
            this.animation = undefined;
        }
    }

    enterState(params?: any) {
        if (params) {
            this.forceAnimation = params.forced || false;
            this.animation = params.interpolator;
            this.animation.onFinished = () => this.becomeIdle();
            this.animation.play();
        } else {
            this.becomeIdle();
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
 * Selection state.
 *  TODO single click
 *  TODO rectangular selection
 *  TODO lasso selection
 *  TODO circular selection
 *  TODO pie selection
 *  TODO visual overlay effect
 */
class Selecting extends Panning {
    
}


/**
 * Property editing state.
 *  TODO edit detection
 *  TODO input overlay (else ?)
 */
class Editing extends BaseState {

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

export class CanvasSelection extends Observable<Array<ViewVertex>> {
    private items: ViewVertex[];

    setSelection(items: ViewVertex[]) {
        // TODO emit deselection
        // update internals
        // TODO emit selection
    }
}
