/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {Camera, ICameraObserver} from "../../common/camera";
import {ViewGroup} from "../../common/viewmodel";
import {IPlatformLayer} from "../../common/renderer";

/**
 * Provides a pan-zoom surface for pixi.js.
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

/**
 * Implements a pixi.js graph layer system.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiLayer implements IPlatformLayer {
    private camera: PixiCamera;
    private graphics: PIXI.Graphics;
    private stage: PIXI.Container;
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private render: any;

    retrieveCamera(): Camera {
        return this.camera;
    }

    setModel(model: ViewGroup) {

    }

    /**
     * Simply issue drawing commands.
     */
    onViewResized() {
        let width = this.camera.visualWidth;
        let height = this.camera.visualHeight;
        this.renderer.resize(width, height);
        this.render(this.stage);
    }

    /**
     * Simply issue drawing commands.
     * @param posX
     * @param posY
     */
    onPanChanged(posX: number, posY: number) {
        this.render(this.stage);
    }

    /**
     * Simply issue drawing commands.
     * @param zoom
     */
    onZoomChanged(zoom: number) {
        this.render(this.stage);
    }

    constructor(element: HTMLElement) {
        this.graphics = new PIXI.Graphics();
        this.camera = new PixiCamera(this.graphics);
        this.stage = new PIXI.Container();
        this.renderer = new PIXI.WebGLRenderer();
        this.render = this.renderer.render;
    }
}
