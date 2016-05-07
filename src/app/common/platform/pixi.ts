/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {Camera} from "../../common/camera";
import {ViewGroup} from "../../common/viewmodel";
import {IPlatformLayer} from "../../common/renderer";

/**
 * Provides a pan-zoom surface for pixi.js.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiCamera extends Camera {

    private s = this.stage.scale;
    private p = this.stage.position;

    protected translateWorldTo(tX:number, tY:number) {
        this.p.set(tX, tY);
    }

    protected scaleWorldTo(zoom:number) {
        this.s.set(zoom, zoom);
    }

    constructor(private stage: PIXI.Container) {
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

    cachedGroups:Array<ViewGroup>;

    getCamera():Camera {
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
        this.stage = new PIXI.Container();
        this.camera = new PixiCamera(this.stage);
        this.renderer = PIXI.autoDetectRenderer(500,500);
        this.render = this.renderer.render;
        element.appendChild(this.renderer.view)
    }
}
