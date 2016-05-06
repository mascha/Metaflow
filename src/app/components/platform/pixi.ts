/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {Camera, ICameraObserver} from "../../common/camera";
import {ViewGroup} from "../../common/viewmodel";

/**
 * Provides a pan-zoom surface for Pixi.js.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiCamera extends Camera {

    protected translateWorldTo(tX:number, tY:number) {
        const position = this.graphics.position;
        position.x = tX;
        position.y = tY;
    }

    protected scaleWorldTo(zoom:number) {
        let scale = this.graphics.scale;
        scale.x = zoom;
        scale.y = zoom;
    }

    constructor(private graphics: PIXI.Graphics) {
        super();
    }
}

export function PixiCameraProvider(graphics: PIXI.Graphics): Camera {
    return new PixiCamera(graphics);
}

export function PixiStageProvider(): any {
    return new PIXI.Container();
}

export function PixiGraphicsProvider(): PIXI.Graphics {
    return new PIXI.Graphics();
}


export class PixiLayer implements ICameraObserver {
    
    onViewResized():void {
    }

    onPanChanged(posX:number, posY:number):void {
    }

    onZoomChanged(zoom:number):void {
    }

}
