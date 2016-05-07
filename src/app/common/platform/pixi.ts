/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {Camera} from "../camera";
import {ViewGroup, ViewItem, ViewVertex} from "../viewmodel";
import {IPlatformLayer, IViewModelRenderer} from "../platform";
import WebGLRenderer = PIXI.WebGLRenderer;

/**
 * Provides a pan-zoom surface for
 *
 * TODO: Implement a LOD vs Text sclaing loop
 * TODO: Combine with group caching etc.
 * TODO: Split into node-, label & edge layer
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
    private pixi: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private renderer: PixiRenderer;
    private webgl: boolean;

    cachedGroups:Array<ViewGroup>;

    getCamera():Camera {
        return this.camera;
    }

    setModel(level: ViewGroup) {
        this.stage.removeChildren();

        // first level
        let renderer = this.renderer;
        renderer.renderGroup(level, true);

        // second levels
        this.cachedGroups = [];
        for (let i = 0, contents = level.contents, len = contents.length; i < len; i++) {
            let item = contents[i];
            if (item instanceof ViewGroup) {
                this.cachedGroups.push(item);
                renderer.renderGroup(item, false);

                // third levels
                // todo make dynamic!
                if (item.contents) {
                    item.contents.forEach(it => {
                        if (it instanceof ViewGroup) {
                            renderer.renderGroup(it, false);
                        } else if (it instanceof ViewItem){
                            renderer.renderItem(it);
                        }
                        renderer.attach(it, item);
                    })
                }
            } else if (item instanceof ViewItem) {
                renderer.renderItem(item);
            }
            renderer.attach(item, level);
        }

        this.stage.addChild(level.visual);
    }

    /**
     * Simply issue drawing commands.
     */
    onViewResized() {
        let renderer = this.pixi;
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
        this.pixi.render(this.stage);
    }

    /**
     * Simply issue drawing commands.
     * @param zoom
     */
    onZoomChanged(zoom: number) {
        // this.stage.updateTransform();
        this.pixi.render(this.stage);
    }

    constructor(element: HTMLCanvasElement) {
        this.stage = new PIXI.Container();
        this.camera = new PixiCamera(this.stage);
        this.renderer = new PixiRenderer();

        let options = {
            antialiasing: true,
            transparent: true,
            view: element,
            resolution: 1
        };
        
        this.pixi = PIXI.autoDetectRenderer(500, 500, options);
        this.webgl = (this.pixi instanceof WebGLRenderer)? true : false;
    }
}


/**
 * Implements the pixi.js platform renderer.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiRenderer implements IViewModelRenderer<any, any> {

    renderItem(item:ViewItem) : any {
        let shape = new PIXI.Graphics()
            //.lineStyle(4, 0x3367D6, 1)
            .beginFill(0x66CCFF)
            .drawRect(item.left, item.top, item.width, item.height)
            .endFill();
        item.visual = shape;
    }

    renderGroup(group: ViewGroup, topLevel: boolean):any {
        let root = new PIXI.Container();
        root.width = group.width;
        root.height = group.height;

        if (!topLevel) {
            root.position.set(group.left, group.top);
        }

        let label = new PIXI.Text(group.label);

        let shape = new PIXI.Graphics();
        shape.lineStyle(16, 0xeeeeee);
        shape.drawRoundedRect(0, 0, group.width, group.height, 12);

        let content = new PIXI.Container();
        let inner = group.scale;
        content.scale.set(inner, inner);

        root.addChild(shape);
        root.addChild(label);
        root.addChild(content);

        group.visual = root;
    }

    renderTree(group:ViewGroup):any {
        throw new Error('Not implemented yet');
    }

    attach(node:ViewVertex, group:ViewGroup) {
        let child = node.visual;
        if (!child) throw new Error('Node has no rendered visual');

        let root = group.visual as PIXI.Container;
        if (!root) throw new Error('Could not find renderer visual of the given group');

        let content = root.children[2] as PIXI.Container;
        if (!content) throw new Error('Could not find low level content container');

        content.addChild(child);
    }

}
