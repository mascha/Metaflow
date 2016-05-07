/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {Camera} from "../camera";
import {ViewGroup, ViewItem, ViewVertex} from "../viewmodel";
import {IPlatformLayer, IViewModelRenderer} from "../renderer";

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
    private stage: PIXI.Container;
    private renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer;

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
        let renderer = this.renderer;
        let width = this.camera.visualWidth;
        let height = this.camera.visualHeight;
        renderer.resize(width, height);
        renderer.render(this.stage);
    }

    /**
     * Simply issue drawing commands.
     * @param posX
     * @param posY
     */
    onPanChanged(posX: number, posY: number) {
        // this.stage.updateTransform();
        this.renderer.render(this.stage);
    }

    /**
     * Simply issue drawing commands.
     * @param zoom
     */
    onZoomChanged(zoom: number) {
        // this.stage.updateTransform();
        this.renderer.render(this.stage);
    }

    constructor(element: HTMLCanvasElement) {
        this.stage = new PIXI.Container();
        this.camera = new PixiCamera(this.stage);

        let options = {
            antialiasing: true,
            transparent: true,
            view: element
        };
        
        this.renderer = PIXI.autoDetectRenderer(500, 500, options);
    }
}


/**
 * Implements the pixi.js platform renderer.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiRenderer implements IViewModelRenderer<any, any> {

    renderItem(item:ViewItem):any {
        return new PIXI.Graphics()
            .lineStyle(4, 0xFF3300, 1)
            .beginFill(0x66CCFF)
            .drawRect(item.left, item.top, item.width, item.height)
            .endFill();
    }

    renderGroup(group:ViewGroup, topLevel:boolean):any {
        let root = new PIXI.Container();
        root.width = group.width;
        root.height = group.height;

        if (!topLevel) {
            root.position.set(group.left, group.top);
        }

        let label = new PIXI.Text(group.label);

        let shape = new PIXI.Graphics();
        shape.lineStyle(4, 0xFF3300, 1);
        shape.drawRect(0, 0, root.width, root.height);

        let content = new PIXI.Container();
        let inner = group.scale;
        content.scale.set(inner, inner);

        root.addChild(label);
        root.addChild(shape);
        root.addChild(content);
    }

    renderTree(group:ViewGroup):any {
        throw new Error('Not implemented yet');
    }

    attach(node:ViewVertex, group:ViewGroup) {
        let child = node.visual;
        if (!child) throw new Error('Node has no rendered visual');

        let root = group.visual as PIXI.Container;
        if (!root) throw new Error('Could not find renderer visual of the given group');

        let content = root.children[1] as PIXI.Container;
        if (!content) throw new Error('Could not find low level content container');

        content.addChild(child);
    }

}
