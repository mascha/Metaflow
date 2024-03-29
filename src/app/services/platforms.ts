import {Injectable} from '@angular/core';
import {RenderLayer, Diagram} from "../common/layer";
import {PixiLayer} from "../platform/pixilayer";
import {API} from './models';

/**
 * Service which provides the underlying rendering platform.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable()
export default class PlatformService {

    /**
     * Retrieve a newly initialized rendering layer, which
     * will be added to the DOM.
     * @param element A html canvas element. Currently only canvas is supported.
     * @returns {PlatformLayer}
     */
    initializeRenderer(element: HTMLCanvasElement): RenderLayer<Diagram> {
        return new PixiLayer(element, this.models);
    }

    constructor(private models: API) {
        
    }
}
