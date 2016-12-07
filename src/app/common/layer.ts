import {ViewGroup, ViewItem, ViewVertex, Model} from './viewmodel';
import {Selection} from './selection';
import {Camera} from './camera';
import {Observable} from "rxjs/Rx";

/**
 * Diagram interface definition.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface Diagram {
    readonly camera: Camera;

    /**
     * The currently active model, if any.
     * Setting a new model will reset the diagram.
     */
    readonly model: Observable<Model>;

    /**
     * The currently active scope of the diagran. Always a 
     * subset of the current model. Null if model is null.
     */
    readonly scope: Scope;
    readonly selection: Selection<ViewVertex>;
} 

/**
 * Responsible for handling the platform dependent methods.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface RenderLayer extends Layer {
    setQuality(quality: Quality);
    readonly camera: Camera;
}


/**
 * Renderer quality hint.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum Quality {
    EPIC = 1.0,
    HIGH = 0.8,
    MEDIUM = 0.6,
    LOWER = 0.4,
    LOW = 0.2,
    LOWEST = 0
}

/**
 * Platform layer
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface RenderLayer extends Layer {
    setQuality(quality: Quality); 
    getCamera(): Camera;
}

/**
 * A diagram layer.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface Layer {

    /**
     * A callback for registering observables after the diagram has been created.
     */
    initialize(diagram: Diagram);

    /**
     * Make layer active or not.
     */
    setActive(active: boolean);

    /**
     * Check wether the layer is current active. 
     */
    isActive(): boolean;
}

/**
 * A view model renderer.
 *
 * @author Martin Schade.
 * @since 1.0.0
 */
export interface ViewModelRenderer<I, G> {

    /**
     * Render a view item.
     */
    renderItem(item: ViewItem): I;

    /**
     * Render a view group.
     */
    renderGroup(group: ViewGroup, topLevel: boolean, oblique: boolean): G;

    /**
     * Attach node to scene.
     */
    attach(node: ViewVertex, group: ViewGroup)
}

/**
 * Diagram scope.
 * 
 * Is responsible for maintaining the current level of reference, which is
 * a cursor within the viewmodel tree, allowing for lazy loading and infinite zooming.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface Scope extends Observable<ViewGroup> {
    readonly limits: ClientRect;
    readonly current: ViewGroup;
}