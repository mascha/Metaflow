import {Camera} from '../../common/camera';
import {ViewGroup} from '../../common/viewmodel/viewmodel';
import {Interpolator} from './animations';
import Kinetics from '../../common/kinetics';
import Diagram from './diagram';

/**
 * All possible diagram events.
 *  TODO make this more elegant!
 */
export interface DiagramEvents {

    /**
     * Handle a single/double click.
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

    protected camera: Camera;

    protected limits = {
        left : -800,
        top : -800,
        right : 2800,
        bottom : 2800
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
        // this.loadLevel(level);
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

        if (true /* !this.detectAndDoSwitch() */) {
            if (this.diagram.respectLimits) {
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

    protected violations = {
        left: false,
   	    right: false,
        bottom: false,
        top: false,
    }

    protected anchor = {
        x: 0,
        y: 0,
        dragX: 0,
        dragY: 0,
    }

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
        this.anchor.x = 0;
        this.anchor.y = 0;
        this.anchor.dragX = 0;
        this.anchor.dragY = 0;
        this.violations.left = false;
        this.violations.right = false;
        this.violations.bottom = false;
        this.violations.top = false;
    }

    handleMouseDown(x: number, y: number) {
        let anchor = this.anchor;
        anchor.dragX = x;
        anchor.dragY = y;
        anchor.x = this.camera.cameraX;
        anchor.y = this.camera.cameraY;
    }

    handleMouseMove(x: number, y: number) {
        const anchor = this.anchor;
        const dragX = anchor.dragX - anchor.x - x;
        const dragY = anchor.dragY - anchor.x - y;

        let limitX = dragX, limitY = dragY;

        if (this.diagram.respectLimits) {
            limitX = this.handleLimits(true, dragX);
            limitY = this.handleLimits(false, dragY);
        }

        if (this.diagram.useKinetics) {
            this.kinetics.update(dragX, dragY);
        }

        const diffX = true // Math.abs(limitX - dragX) > 1e-2;
        const diffY = true // Math.abs(limitY - dragY) > 1e-2;

        if (diffX || diffY) {
            this.camera.moveTo(limitX, limitY);
        }
    }

    handleMouseUp(x: number, y: number) {
        const kinetic = this.isKinetic();
        const banding = this.isBanding();

        if (banding) {
            if (this.diagram.animatedNavigation) {
                const ca = this.camera;
                const wX = ca.worldX, wW = wX + ca.projWidth;
                const wY = ca.worldY, wH = wY + ca.projHeight;
                const dx = this.horizontalDisplacement(wX, wW);
                const dy = this.verticalDisplacement(wY, wH);
                this.machine.transitionTo('animating', {
                    forced: false, interpolator: Interpolator.centerOnWorld(
                        wX + ca.projWidth / 2 - dx,
                        wY + ca.projHeight / 2 - dy,
                        300, this.camera
                    )
                });
            } else {
                this.becomeIdle();
            }
            
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
            this.becomeIdle();
        }
    }

    private adjustLimit(level: ViewGroup) {
        let limits = this.limits;
        const widthSpan = 0.9 * level.width;
        const heightSpan = 0.9 * level.height;
        limits.left = level.left - widthSpan;
        limits.top = level.top - heightSpan;
        limits.bottom = level.left + level.height + heightSpan;
        limits.right = level.left + level.width + widthSpan;
    }

    /**
     * Returns the horizontal displacement needed to return the camera to the center.
     * Measured in world coordinates.
     */
    private horizontalDisplacement(wX: number, wW: number): number {
        let violation = this.violations;
        return (violation.left) ? wX - this.limits.left : (violation.right) ? wW - this.limits.right : 0;
    }

    /**
     * Returns the vertical displacement needed to return the camera to the center.
     * Measured in world coordinates.
     */
    private verticalDisplacement(wY: number, wH: number): number {
        let violation = this.violations;
        return (violation.top) ? wY - this.limits.top : (violation.bottom) ? wH - this.limits.bottom : 0;
    }

    /**
     * Check wether banding rules apply.
     */
    private isBanding(): boolean {
        let v = this.violations;
        return (this.diagram.doBanding && (v.left || v.right || v.bottom || v.top));
    }

    /**
     * Check wether kinetic rules apply.
     */
    private isKinetic(): boolean {
        return (this.diagram.useKinetics && this.kinetics.hasEnoughMomentum());
    }

    /**
     * Calculate a damping factor from a limit violation.
     */
    private damp(actual: number, limit: number): number {
        let ratio = Math.abs(actual / limit);
        return 1 + Math.log10(ratio || 1);
    }

    /**
     * Update the internal banding state.
     */
    private updateBanding(horizontal: boolean, lower: boolean, value: boolean) {
        const violation = this.violations;
        if (horizontal) {
            if (lower) { violation.left = value; }
            else { violation.right = value; }
        } else {
            if (lower) { violation.top = value; }
            else { violation.bottom = value; }
        }
    }

    /**
     * Returns the drag coordiante, accounting for damping/banding effects.
     */
    private handleLimits(horizontal: boolean, drag: number): number {
        const cam = this.camera, limit = this.limits;
        const min = horizontal ? cam.worldX : cam.worldY;
        const wid = horizontal ? cam.projWidth : cam.projHeight;
        const lower = horizontal ? limit.left : limit.top;
        const higher = horizontal ? limit.right : limit.bottom;
        const band = this.diagram.doBanding;
        const scale = cam.scale, max = min + wid;

        if (min <= lower) {
            if (band) {
                this.updateBanding(horizontal, true, true);
                const factor = this.damp(drag / scale, lower);
                return factor * lower * scale;
            } else {
                return lower + 1;
            }
        } else {
            this.updateBanding(horizontal, true, false);
        }

        if (max >= higher) {
            if (band) {
                this.updateBanding(horizontal, false, true);
                const factor = this.damp(drag / scale + wid, higher);
                return (factor * higher - wid) * scale;
            } else {
                return higher - 1;
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
