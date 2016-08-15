import {Camera} from "../common/camera";
import {ViewGroup, ViewItem, ViewVertex} from "../common/viewmodel";
import {PlatformLayer, ViewModelRenderer} from "../common/platform";
import ShapeRenderer from './render';

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
    private mapper: PixiMapper;

    cachedGroups: Array<ViewGroup>;

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
        
        let leafStyle : PIXI.TextStyle = { 
            fill: 0x3d3834,
            stroke: 'white',
            strokeThickness: 8,
            lineJoin: 'round'
        }

        let groupStyle : PIXI.TextStyle = { 
            fill: 0x3367d6,
            stroke: 'white',
            strokeThickness: 8,
            lineJoin: 'round'
        }

        for (let i = 0; i < length; i++) {
            let item = contents[i];
            let itemLabel: PIXI.Text; 

            if (!item.isLeaf()) {
                itemLabel = new PIXI.Text(item.label, groupStyle, 0.6);
                itemLabel.pivot.set(
                    itemLabel.text.length * 6, 
                    12
                );
                itemLabel.position.set(
                    (item.left + item.width / 2 - itemLabel.text.length * 3) * level.scale,
                    (item.top + item.height / 2 - 15) * level.scale
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
                itemLabel = new PIXI.Text(item.label, leafStyle, 0.6);
                itemLabel.pivot.set(
                    14, 
                    6
                );
                itemLabel.position.set(
                    (item.left + item.width * 1.1) * level.scale,
                    (item.top + item.height / 2) * level.scale
                );
                mapper.renderItem(item as ViewItem);
            }

            this.labels.addChild(itemLabel);
            mapper.attach(item, level);
        }
        this.attachNode(level);
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
        this.mapper = new PixiMapper();

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
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiCamera extends Camera {

    private worldScale = this.world.scale;
    private worldPosition = this.world.position;
    private overlayPosition = this.overlay.position;
    private overlayScale = this.overlay.scale;

    protected translateWorldTo(tX: number, tY: number) {
        this.worldPosition.set(tX, tY);
        this.overlayPosition.set(tX, tY);
    }

    protected scaleWorldTo(zoom: number, last: number) {
        this.worldScale.set(zoom, zoom);
        this.overlayScale.set(zoom, zoom);

        /**
         * TODO Iterate over visible children only
         * TODO min max label scales
         * TODO outsource to thread
         */
        let lbs = this.overlay.children;
        let s = .5 / zoom;
        // s = s <= 0.5 ? 0.5 : (s >= 2) ? 2 : s;
        for (let i = 0, len = lbs.length; i < len; i++) {
            let label = lbs[i] as PIXI.Text;
            label.scale.set(s, s);
        }
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
export class PixiMapper implements ViewModelRenderer<any, any> {

    nodes: PIXI.Graphics;
    shapes: ShapeRenderer;

    renderItem(item: ViewItem): any {
        if (item.visual) {
            return;
        } else {
            let visual = new PIXI.Graphics();
            let style = item.style;
            this.shapes.renderShape(style, visual, item)
            item.visual = visual;
        }
    }

    renderGroup(group: ViewGroup, topLevel: boolean, oblique: boolean): any {
        if (group.visual) {
            return;
        }
        
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

        if (!topLevel && !oblique) {
            // root.cacheAsBitmap = true;
        }

        group.visual = root;
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

    constructor() {
        this.shapes = new ShapeRenderer();
    }
}

/**
 * A configuration object for the pixi layer system.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiConfig {
    labelResolution = 0.6
    backgroundStrength = 8
    baseScale = 0.5
    labelBatchSize = 500
} 