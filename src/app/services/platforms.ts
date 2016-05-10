import {Injectable} from '@angular/core';
import {IPlatformLayer} from "../common/platform";
import {PixiLayer} from "../common/platform/pixi";

/**
 * Service, which provides the underlying rendering platform.
 * @author Martin Schsfr
 */
@Injectable()
export class PlatformService {

    /**
     * Retrieve a newly initialized rendering layer, which
     * will be added to the DOM.
     * @param element A html canvas element. Currently only canvas is supported.
     * @returns {IPlatformLayer}
     */
    getPlatform(element: HTMLCanvasElement): IPlatformLayer {
        return new PixiLayer(element);
    }
}
