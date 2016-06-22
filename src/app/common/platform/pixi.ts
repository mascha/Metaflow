import {Camera} from "../camera";
import {ViewGroup, ViewItem, ViewVertex} from "../viewmodel";
import {PlatformLayer, ViewModelRenderer} from "../platform";

/**
 * Provides a pan-zoom surface for the PIXI renderer.
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
export class PixiLayer implements PlatformLayer {

    private camera: PixiCamera;
    private stage: PIXI.Container;
    private pixi: PIXI.WebGLRenderer | PIXI.CanvasRenderer;
    private renderer: PixiRenderer;
    private webgl: boolean;

    cachedGroups:Array<ViewGroup>;

    getCamera(): Camera {
        return this.camera;
    }

    setModel(level: ViewGroup) {
        let now = Date.now();
        this.stage.removeChildren();

        // first level
        let renderer = this.renderer;
        renderer.renderGroup(level, true, false);

        // second levels
        this.cachedGroups = [];
        let contents = level.contents;
        let length = contents.length;
        for (let i = 0; i < length; i++) {
            let item = contents[i];
            if (!item.isLeaf()) {
                let itm = item as ViewGroup;
                this.cachedGroups.push(itm);
                if (itm.contents && itm.contents.length > 0) {
                    renderer.renderGroup(itm, false, false);
                    itm.contents.forEach(it => {
                        if (!it.isLeaf()) {
                            renderer.renderGroup(it as ViewGroup, false, true);
                        } else if (it.isLeaf()) {
                            renderer.renderItem(it as ViewItem);
                        }
                        renderer.attach(it, itm);
                    });
                } else {
                    renderer.renderGroup(itm, false, true);
                }
            } else if (item.isLeaf()) {
                renderer.renderItem(item as ViewItem);
            }
            renderer.attach(item, level);
        }

        this.stage.addChild(level.visual);
        console.log(`Model rendering took ${Date.now() - now} ms`);
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
        this.pixi.render(this.stage);
    }

    /**
     * Simply issue drawing commands.
     * @param zoom
     */
    onZoomChanged(zoom: number) {
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
        
        this.pixi = new PIXI.CanvasRenderer(500, 500, options);
        this.webgl = (this.pixi instanceof PIXI.WebGLRenderer)? true : false;
    }
}


/**
 * Implements the pixi.js platform renderer.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiRenderer implements ViewModelRenderer<any, any> {

    renderItem(item: ViewItem): any {
        let shape = new PIXI.Graphics()
            .lineStyle(4, 0x3367D6, 1)
            .beginFill(0x66CCFF)
            .drawRoundedRect(item.left, item.top, item.width, item.height, 3)
            .endFill();
        item.visual = shape;
    }

    renderGroup(group: ViewGroup, topLevel: boolean, oblique: boolean): any {
        let root = new PIXI.Container();
        root.width = group.width;
        root.height = group.height;

        if (!topLevel) {
            root.position.set(group.left, group.top);
        }

        let label = new PIXI.Text(group.label);

        let shape = new PIXI.Graphics();


        if (oblique) {
            shape.beginFill(0xeeeeee);
            shape.drawRoundedRect(0, 0, group.width, group.height, 12);
            shape.endFill();
        } else {
            shape.lineStyle(16, 0xeeeeee);
            shape.drawRoundedRect(0, 0, group.width, group.height, 12);
        }

        let content = new PIXI.Container();
        let inner = group.scale;
        content.scale.set(inner, inner);

        root.addChild(shape);
        root.addChild(label);
        root.addChild(content);

        group.visual = root;
    }

    renderTree(group: ViewGroup): any {
        throw new Error('Not implemented yet');
    }

    attach(node: ViewVertex, group: ViewGroup) {
        let child = node.visual;
        if (!child) {
            throw new Error('Node has no rendered visual');
        }

        let root = group.visual as PIXI.Container;
        if (!root) {
            throw new Error('Could not find renderer visual of the given group');
        }

        /* TODO fix this direct index access */
        let content = root.children[2] as PIXI.Container;
        if (!content) {
            throw new Error('Could not find low level content container');
        }

        content.addChild(child);
    }

}
