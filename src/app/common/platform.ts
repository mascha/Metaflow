import {ViewGroup, ViewItem, ViewVertex} from "./viewmodel";
import {CameraObserver, Camera} from "./camera";

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
    renderGroup(group: ViewGroup, topLevel: boolean): G;

    /**
     * 
     */
    renderTree(group: ViewGroup): G;

    /**
     *
     */
    attach(node: ViewVertex, group: ViewGroup)
}

/**
 * Responsible for handling the platform dependent methods.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface PlatformLayer extends CameraObserver {
    cachedGroups: Array<ViewGroup>;
    getCamera(): Camera;
    setModel(model: ViewGroup)
}

