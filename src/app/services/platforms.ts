import {Injectable} from '@angular/core';
import {IPlatformLayer} from "../common/renderer";
import {KonvaLayer} from "../components/platform/konva";

@Injectable()
export class PlatformService {
    getPlatform(element: HTMLElement): IPlatformLayer {
        return new KonvaLayer(element);
    }
}
