import {Camera} from "../camera";
import {ViewGroup, ViewItem, ViewVertex} from "../viewmodel/viewmodel";
import {PlatformLayer, ViewModelRenderer} from "../platform";

/**
 * Implements a pixi.js graph layer system.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiLayer implements PlatformLayer {

    private camera: PixiCamera;
    private scene: PIXI.Container;
    private nodes: PIXI.Container;
    private world: PIXI.Container;
    private overlay: PIXI.Container;
    private edges: PIXI.Container;
    private labels: PIXI.Container;
    private renderer: PIXI.SystemRenderer;
    private mapper: PixiRenderer;

    cachedGroups:Array<ViewGroup>;

    getCamera(): Camera {
        return this.camera;
    }

    setModel(level: ViewGroup) {
        let now = Date.now();
        this.nodes.removeChildren();
        this.labels.removeChildren();

        // first level
        let mapper = this.mapper;
        mapper.renderGroup(level, true, false);

        // second levels
        this.cachedGroups = [];
        let contents = level.contents;
        let length = contents.length;
        for (let i = 0; i < length; i++) {
            let item = contents[i];
            let itemLabel = new PIXI.Text(item.label);
            let scale = 0.01 + Math.random() * 0.5;
            itemLabel.scale.set(scale, scale);
            this.labels.addChild(itemLabel);

            if (!item.isLeaf()) {
                itemLabel.position.set(
                    item.left * level.scale,
                    item.top * level.scale
                );

                let itm = item as ViewGroup;
                this.cachedGroups.push(itm);
                if (itm.contents && itm.contents.length > 0) {
                    mapper.renderGroup(itm, false, false);
                    itm.contents.forEach(it => {
                        if (!it.isLeaf()) {
                            mapper.renderGroup(it as ViewGroup, false, true);
                        } else if (it.isLeaf()) {
                            mapper.renderItem(it as ViewItem);
                        }
                        mapper.attach(it, itm);
                    });
                } else {
                    mapper.renderGroup(itm, false, true);
                }
            } else if (item.isLeaf()) {
                itemLabel.position.set(
                    (item.left + item.width * 1.12) * level.scale,
                    (item.top + item.height / 4)* level.scale
                );
                mapper.renderItem(item as ViewItem);
            }
            mapper.attach(item, level);
        }

        this.attachNode(level);
        console.log(`Model rendering took ${Date.now() - now} ms`);
    }

    /**
     * Simply issue drawing commands.
     */
    onViewResized() {
        let renderer = this.renderer;
        let width = this.camera.visualWidth;
        let height = this.camera.visualHeight;
        renderer.resize(width, height);
        renderer.render(this.scene);
    }

    /**
     * Simply issue drawing commands.
     * @param posX
     * @param posY
     */
    onPanChanged(posX: number, posY: number) {
        this.renderer.render(this.scene);
    }

    /**
     * Simply issue drawing commands.
     * @param zoom
     */
    onZoomChanged(zoom: number) {
        this.renderer.render(this.scene);
    }

    private attachNode(level: ViewGroup) {
        this.nodes.addChild(level.visual);
    }

    constructor(element: HTMLCanvasElement) {
        /* create root */
        this.scene = new PIXI.Container();

        /* overlays */
        // this.overlay = new PIXI.Container();
        this.labels = new PIXI.Container();
        this.overlay = this.labels;

        /* worlds */
        // this.world = new PIXI.Container();
        // this.edges = new PIXI.Container();
        this.nodes = new PIXI.Container();
        this.world = this.nodes;

        /* assemble in order of rendering */
        // this.overlay.addChild(this.labels);
        // this.world.addChild(this.nodes);
        // this.world.addChild(this.edges);
        this.scene.addChild(this.world);
        this.scene.addChild(this.overlay);

        this.camera = new PixiCamera(this.world, this.overlay);
        this.mapper = new PixiRenderer();

        this.renderer = new PIXI.CanvasRenderer(500, 500, {
            antialias: true,
            transparent: true,
            resolution: 1.0,
            view: element
        });
    }
}

/**
 * Provides a pan-zoom surface for the PIXI renderer.
 *
 * TODO: Implement a LOD vs Text scaling loop
 * TODO: Combine with group caching etc.
 * TODO: Split into node-, label & edge layer
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiCamera extends Camera {

    private worldScale = this.world.scale;
    private worldPosition = this.world.position;
    private overlayPosition = this.overlay.position;

    protected translateWorldTo(tX: number, tY: number) {
        this.worldPosition.set(tX, tY);
        this.overlayPosition.set(tX, tY);
    }

    protected scaleWorldTo(zoom: number, last: number) {
        this.worldScale.set(zoom, zoom);
        this.overlay.scale.set(zoom, zoom);
    }

    constructor(private world: PIXI.Container,
                private overlay: PIXI.Container) {
        super();
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
        item.visual = item.visual ||
            new PIXI.Graphics()
                .lineStyle(4, 0x3367D6, 1)
                .beginFill(0x66CCFF)
                .drawRoundedRect(item.left, item.top, item.width, item.height, 3)
                .endFill();
    }

    renderGroup(group: ViewGroup, topLevel: boolean, oblique: boolean): any {
        let root = new PIXI.Container();
        root.width = group.width;
        root.height = group.height;

        if (!topLevel) {
            root.position.set(group.left, group.top);
        }

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
        let content = root.children[1] as PIXI.Container;
        if (!content) {
            throw new Error('Could not find low level content container');
        }

        content.addChild(child);
    }
}
