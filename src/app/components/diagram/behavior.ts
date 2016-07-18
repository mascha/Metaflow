import {Camera} from '../../common/camera';
import {ViewGroup, ViewVertex} from '../../common/viewmodel/viewmodel';
import {Interpolator} from './animations';
import Kinetics from '../../common/kinetics';
import Diagram from './diagram';


/**
 * All possible diagram events.
 *  TODO make this more elegant!
 */
export interface DiagramEvents {

    /**
     * 
     */
    handleClick(x: number, y: number, double: boolean)

    /**
     * 
     */
    handleMouseDown(x: number, y: number)

    /**
     * 
     */
    handleMouseMove(x: number, y: number)

    /**
     * 
     */
    handleMouseUp(x: number, y: number)

    /**
     * 
     */
    handleZoom(x: number, y: number, f: number)

    /**
     * Handle a key event.
     */
    handleKey(event: KeyboardEvent)

    /**
     * Force the immediate cancellation of the current's states acitivites.
     * Mainly used for recovery of the state machinery.
     */
    handleAbort()

    /**
     * Notify the state that is should terminate, but does not need to.
     */
    handleStop()

    setModel(level: ViewGroup)
}

/**
 * Diagram state definition.
 * @author Martin Schade
 * @since 1.0.0
 */
export interface DiagramState extends DiagramEvents {

    /**
     * Enter the state and execute it's initialization.
     * @param params Optional initialization parameters.
     */
    enterState(params?: any)

    /**
     * Exit the current state and perform cleanup.
     */
    leaveState()
}

/**
 * State machine interface.
 */
export interface StateMachine {

    /**
     * Execute a state transition.
     * @param state
     * @param params
     */
    transitionTo(state: string, params?: any)

    /**
     * Reenter the current state with different or no parameters.
     */
    reenterState(params?: any)
}


/**
 * The state machine for the diagramming view.
 * Simply delegates all events to the currently active state.
 * @author Martin Schade
 * @since 1.0.0
 */
export default class DiagramBehavior implements StateMachine, DiagramEvents {
    private current: DiagramState;
    private states: any;
    private debug = false;

    handleClick(x: number, y: number, double: boolean) {
        this.current.handleClick(x, y, double);
    }

    handleMouseDown(x: number, y: number) {
        this.current.handleMouseDown(x, y);
    }

    handleMouseMove(x: number, y: number) {
        this.current.handleMouseMove(x, y);
    }

    handleMouseUp(x: number, y: number) {
        this.current.handleMouseUp(x, y);
    }

    handleZoom(x: number, y: number, f: number) {
        this.current.handleZoom(x, y, f);
    }

    handleKey(event: KeyboardEvent) {
        this.current.handleKey(event);
    }

    handleAbort() {
        this.current.handleAbort();
    }

    handleStop() {
        this.current.handleStop();
    }

    setModel(level: ViewGroup) {
        this.current.setModel(level);
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
        } else if (this.debug) {
            console.log(`diagram state '${state}' not found`);
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
 * Base state which contains reused state data.
 * @author Martin Schade
 * @since 1.0.0
 */
abstract class BaseState implements DiagramState {

    protected limits = {
        left : -0,
        top : 0,
        right : 2000,
        bottom : 2000,
        adjustTo : function(level: ViewGroup) {
            const widthSpan = 0.9 * level.width;
            const heightSpan = 0.9 * level.height;
            this.leftLimit = -widthSpan;
            this.topLimit = -heightSpan;
            this.botLimit = level.height + heightSpan;
            this.rightLimit = level.width + widthSpan;
        }
    }

    protected camera: Camera;
    protected current: ViewGroup;

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
        console.log(this.limits);
        this.limits.adjustTo(level);
        console.log(this.limits);
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

    handleMouseDown(x: number, y: number) { /* ignore*/ }

    handleMouseMove(x: number, y: number) { /* ignore*/ }

    handleMouseUp(x: number, y: number) { /* ignore*/ }

    handleZoom(x: number, y: number, f: number) { /* ignore */ }

    handleKey(event: KeyboardEvent) { /* ignore */ }

    handleAbort() { /* ignore */ }

    handleStop() { /* ignore */ }
    
    setModel(level: ViewGroup) {
        this.loadLevel(level);
    }

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
        this.machine.transitionTo('panning', { x: x, y: y });
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
                if (target >= maxZoom) {
                    target = maxZoom;
                } else {
                    const limits = this.limits;
                    const w = this.camera.visualWidth;
                    const h = this.camera.visualHeight;
                    const l = limits.right - limits.left;
                    const d = limits.bottom - limits.top;
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
    private getAppropriateScale(level?: ViewGroup): number {
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
        const dragX = this.pressedX - this.anchorX - x;
        const dragY = this.pressedY - this.anchorY - y;

        let limitX = dragX, limitY = dragY;

        if (this.diagram.limitMovement) {
            limitX = this.handleLimits(true, dragX);
            limitY = this.handleLimits(false, dragY);
        }

        if (this.diagram.useKinetics)
            this.kinetics.update(dragX, dragY);

        const diffX = true // Math.abs(limitX - dragX) > 1e-2;
        const diffY = true // Math.abs(limitY - dragY) > 1e-2;

        if (diffX || diffY)
            this.camera.moveTo(limitX, limitY);
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
        return (this.offLeft) ? wX - this.limits.left : (this.offRight) ? wW - this.limits.right : 0;
    }

    private verticalDisplacement(wY: number, wH: number): number {
        return (this.offTop) ? wY - this.limits.top : (this.offBottom) ? wH - this.limits.bottom : 0;
    }

    private isBanding(): boolean {
        return (this.diagram.doBanding && (this.offLeft || this.offRight || this.offBottom || this.offTop));
    }

    private isKinetic(): boolean {
        return (this.diagram.useKinetics && this.kinetics.hasEnoughMomentum());
    }

    private damp(actual: number, limit: number): number {
        let ratio = Math.abs(actual / limit);
        return 1 + Math.log10(ratio || 1);
    }

    private updateBanding(horizontal: boolean, lower: boolean, value: boolean) {
        if (horizontal) {
            if (lower) this.offLeft = value;
            else this.offRight = value;
        } else {
            if (lower) this.offTop = value;
            else this.offBottom = value;
        }
    }

    private handleLimits(horizontal: boolean, drag: number): number {
        const cam = this.camera;
        const lim = this.limits;
        const min = horizontal ? cam.worldX : cam.worldY;
        const wid = horizontal ? cam.projWidth : cam.projHeight;
        const lower = horizontal ? lim.left : lim.top;
        const higher = horizontal ? lim.right : lim.bottom;
        const band = this.diagram.doBanding;
        const scale = cam.scale;
        const max = min + wid;

        /**
         * Check if lower limit was violated.
         */
        if (min <= lower) {
            console.log(`${horizontal?'horizontal':'vertical'} lower limit reached`);
            if (band) {
                this.updateBanding(horizontal, true, true);
                const factor = this.damp(drag / scale, lower);
                return factor * lower * scale;
            } else {
                return lower;
            }
        } else {
            this.updateBanding(horizontal, true, false);
        }

        /**
         * Check if upper limit was violated
         */
        if (max >= higher) {
            console.log(`${horizontal?'horizontal':'vertical'} upper limit reached`);
            if (band) {
                this.updateBanding(horizontal, false, true);
                const factor = this.damp(drag / scale + wid, higher);
                return (factor * higher - wid) * scale;
            } else {
                return higher;
            }
        } else {
            this.updateBanding(horizontal, false, false);
        }

        return drag;
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
