import {PlatformLayer, ViewModelRenderer, Quality} from "../common/layer";
import {ViewGroup, ViewItem, ViewVertex} from "../common/viewmodel";
import {Camera, CameraObserver} from "../common/camera";
import ShapeRenderer from './render';

/**
 * Implements a pixi.js graph layer system.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiLayer implements PlatformLayer, CameraObserver {

    private camera: PixiCamera;
    private scene: PIXI.Container;
    private nodes: PIXI.Container;
    private world: PIXI.Container;
    private overlay: PIXI.Container;
    private edges: PIXI.Container;
    private labels: PIXI.Container;
    private renderer: PIXI.SystemRenderer;
    private mapper: ShapeRenderer;
    private quality: Quality;
    private frames: number;

    cachedGroups: Array<ViewGroup>;

    setQuality(quality: Quality) {
        if (quality <= 0 || quality > 1) return;
        this.quality = quality;
        this.frames = 1000 / (60 * quality);
    }

    getCamera(): Camera {
        return this.camera;
    }

    hitTest(worldX: number, worldY: number): Array<ViewVertex> {
        let hits = [];

        return hits;
    }

    observe(camera: Camera) {
        camera.attachObserver(this);
    }

    update(level: ViewGroup) {
        this.nodes.removeChildren();
        this.labels.removeChildren();
        let leafs = new PIXI.Graphics();

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
                itemLabel = new PIXI.Text(item.name, groupStyle, 0.6);
                itemLabel.pivot.set(
                    itemLabel.text.length * 6, 12
                );
                itemLabel.position.set(
                    (item.left + item.width / 2 - itemLabel.text.length * 3) * level.scale,
                    (item.top + item.height / 2 - 15) * level.scale
                );

                let itm = item as ViewGroup;
                this.cachedGroups.push(itm);
                if (itm.contents && itm.contents.length > 0) {
                    mapper.renderGroup(itm, false, false);
                    let subleafs = new PIXI.Graphics();
                    itm.contents.forEach(it => {
                        if (!it.isLeaf()) {
                            mapper.renderGroup(it as ViewGroup, false, true);
                        } else if (it.isLeaf()) {
                            mapper.renderItem(it as ViewItem, subleafs);
                        }
                        mapper.attach(it, itm);
                    });
                } else {
                    mapper.renderGroup(itm, false, true);
                }
            } else if (item.isLeaf()) {
                itemLabel = new PIXI.Text(item.name, leafStyle, 0.6);
                itemLabel.pivot.set(14, 6);
                itemLabel.position.set(
                    (item.left + item.width * 1.1) * level.scale,
                    (item.top + item.height / 2) * level.scale
                );
                mapper.renderItem(item as ViewItem, leafs);
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
        this.mapper = new ShapeRenderer();

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
 * TODO: No scaling if animating / rate limiting
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

    private lastCall = Date.now();

    protected scaleWorldTo(zoom: number, last: number) {
        this.worldScale.set(zoom, zoom);
        this.overlayScale.set(zoom, zoom);

        /**
         * animating + zoom out = no scale update!
         */
        if (Date.now() - this.lastCall > 1000 / 60) {
            let lbs = this.overlay.children;
            let s = .5 / zoom;
            for (let i = 0, len = lbs.length; i < len; i++) {
                let label = lbs[i] as PIXI.Text;
                label.scale.set(s, s);
            }
            this.lastCall = Date.now();
        }
    }

    constructor(private world: PIXI.Container, 
                private overlay: PIXI.Container) {
        super();
    }
}

/**
 * A configuration object for the pixi layer system.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
class PixiConfig {
    labelResolution = 0.6
    backgroundStrength = 8
    baseScale = 0.5
    labelBatchSize = 500
} 