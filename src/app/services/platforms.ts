import {Injectable} from '@angular/core';
import {IPlatformLayer} from "../common/platform";
import {PixiLayer} from "../common/platform/pixi";

@Injectable()
export class PlatformService {
    getPlatform(element: HTMLCanvasElement): IPlatformLayer {
        return new PixiLayer(element);
    }
}
