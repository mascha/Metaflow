import {ViewGroup, ViewItem, ViewNode, ViewModel} from './viewmodel';
import {Selection} from './selection';
import {Camera} from './camera';
import {Observable} from "rxjs/Observable";
import {SpatialStructure} from './spatial';

/**
 * Diagram interface definition.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface Diagram {

    /**
     * Interactive camera instance.
     */
    readonly camera: Camera;

    /**
     * The currently active model, if any.
     * Setting a new model will reset the diagram.
     */
    readonly model: Observable<ViewModel>;

    /**
     * The currently active scope of the diagran. Always a 
     * subset of the current model. Null if model is null.
     */
    readonly scope: Scope;

    /**
     * The currently active selection.
     */
    readonly selection: Selection<ViewNode>;

    /**
     * Spatial information accelerator structure. May be null if not availiable.
     */
    readonly spatial: SpatialStructure<ViewNode>;

    /**
     * Returns all layers in this diagram.
     */
    readonly layers: Array<Layer<Diagram>>;

    /**
     * Issue the event to the canvas.
     * 
     * @param {any} event
     */
    dispatchEvent(event: string, payload?: any);
} 

/**
 * Responsible for handling the platform dependent methods.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface RenderLayer<T> extends Layer<T> {
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
 * A diagram layer.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface Layer<T> {

    /**
     * A callback for registering observables after the diagram has been created.
     */
    initialize(init: T);

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
    attach(node: ViewNode, group: ViewGroup)
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