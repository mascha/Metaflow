import {ViewGroup, ViewItem, ViewVertex} from './viewmodel';
import {Camera} from './camera';

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
export interface PlatformLayer {
    setQuality(quality: Quality); 
    getCamera(): Camera;
}

/**
 * A diagram layer.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface DiagramLayer {

    /**
     * A callback for registering camera movements.
     */
    observe(camera: Camera);

    /**
     * Update the internal or visual state with
     * a new view model.
     */
    update(group: ViewGroup);
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