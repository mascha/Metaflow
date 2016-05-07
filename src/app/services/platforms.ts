import {Injectable} from '@angular/core';
import {IPlatformLayer} from "../common/renderer";
import {KonvaLayer} from "../common/platform/konva";
import {PixiLayer} from "../common/platform/pixi";

@Injectable()
export class PlatformService {
    getPlatform(element: HTMLCanvasElement): IPlatformLayer {
        return new PixiLayer(element);
    }
}
