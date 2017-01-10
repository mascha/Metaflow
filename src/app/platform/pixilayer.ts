import { RenderLayer, ViewModelRenderer, Quality, Diagram } from "../common/layer";
import { ViewGroup, ViewItem, ViewNode } from "../common/viewmodel";
import { Camera, CameraObserver } from "../common/camera";
import { XText, Mapper } from './pixirender';

/**
 * Implements a pixi.js graph layer system.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class PixiLayer implements RenderLayer, CameraObserver {

    readonly camera: Camera;

    /**
     * The full scene to be drawn.
     */
    private scene: PIXI.Container;

    /**
     * All node shapes.
     */
    private nodes: PIXI.Container;

    /**
     * 
     */
    private world: PIXI.Container;

    /**
     * 
     */
    private overlay: PIXI.Container;

    /**
     * 
     */
    private edges: PIXI.Container;

    /**
     * 
     */
    private labels: PIXI.Container;

    private active = true;

    private renderer: PIXI.SystemRenderer;
    private mapper: Mapper;
    private quality: Quality;
    private frames: number;
    private cachedGroups: ViewGroup[];

    getCamera(): Camera {
        return this.camera;
    }

    setQuality(quality: Quality) {
        if (quality < 0 || quality > 1) return;
        this.quality = quality;
        this.frames = 1000 / (60 * quality);
    }

    setActive(active: boolean) {

    }

    isActive() {
        return true;
    }

    hitTest(worldX: number, worldY: number): Array<ViewNode> {
        let hits = [];

        return hits;
    }

    private update(level: ViewGroup) {
        this.nodes.removeChildren();
        this.labels.removeChildren();
        let leafs = new PIXI.Graphics();

        /* render root */
        let mapper = this.mapper;
        mapper.renderGroup(level, true, false);

        // second levels
        this.cachedGroups = [];
        let contents = level.contents;
        let length = contents.length;
        let item = null;

        /* render edges */
        for (let i = 0; i < length; i++) {
            item = contents[i];
            if (item.hasEdges()) {
                this.mapper.renderEdges(item.edges, leafs);
            }
        }

        /* render nodes */
        for (let i = 0; i < length; i++) {
            item = contents[i];
            if (!item.isLeaf()) {
                let itm = item as ViewGroup;
                this.cachedGroups.push(itm);
                if (itm.hasContents()) {
                    mapper.renderGroup(itm, false, true);
                } else {
                    mapper.renderGroup(itm, false, true);
                }
            } else {
                mapper.renderItem(item as ViewItem, leafs);
            }

            mapper.renderLabels(item);
            if (item.labels) this.labels.addChild(item.labels);

            mapper.attach(item, level);
        }

        // finally attach rendered level
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
        if (this.active) renderer.render(this.scene);
    }

    /**
     * Simply issue drawing commands.
     * @param posX
     * @param posY
     */
    onPanChanged(posX: number, posY: number) {
        if (this.active) this.renderer.render(this.scene);
    }

    /**
     * Simply issue drawing commands.
     * @param zoom
     */
    onZoomChanged(zoom: number) {
        if (this.active) this.renderer.render(this.scene);
    }

    initialize(diagram: Diagram) {
        diagram.camera.subscribe(this);
        diagram.scope.subscribe(it => this.update(it));
    }

    private attachNode(level: ViewGroup) {
        this.nodes.addChild(level.visual);
    }

    constructor(element: HTMLCanvasElement, models: any) {
        this.scene = new PIXI.Container();

        /* overlays */
        // this.overlay = new PIXI.Container();
        this.labels = new PIXI.Container(); /* new PIXI.ParticleContainer(2000, {
            scale: true,
            position: true,
            rotation: false,
            uvs: false,
            alpha: false,
        });*/
        this.overlay = this.labels;

        /* worlds */
        // this.world = new PIXI.Container();
        // this.edges = new PIXI.Container();
        this.nodes = new PIXI.Container();
        this.world = this.nodes;

        /* assemble in order of rendering */
        // this.overlay.addChild(this.labels);
        // this.world.addChild(this.nodes);
        // this.scene.addChild(this.edges);
        this.scene.addChild(this.world);
        this.scene.addChild(this.overlay);

        this.camera = new PixiCamera(this.world, this.overlay);
        this.mapper = new Mapper();

        models.fetchFormalisms('systemdynamics').subscribe(formalisms => {
            formalisms.forEach(it => {
                it.syntax.viewpoint.styles.forEach(style => {
                    this.mapper.cacheShape(style)
                })
            });
        });

        this.renderer = new PIXI.WebGLRenderer(element.width, element.height, {
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

    protected scaleWorldTo(zoom: number, last: number) {
        this.worldScale.set(zoom, zoom);
        this.overlayScale.set(zoom, zoom);

        let z = Math.pow(zoom, 0.75);
        let lbs = this.overlay.children as XText[];
        let label = null;
        for (let i = 0, len = lbs.length; i < len; i++) {
            label = lbs[i];
            let s = label.baseScale / z;
            let v = s < label.upperScale;
            if (v) {
                let m = (s - label.lowerScale) / (label.upperScale - label.lowerScale);
                // m = m < 0 ? 0 : m > 1 ? 1 : 0;
                label.alpha = Math.E * Math.exp(-1 / (1 - m * m));
                label.scale.set(s, s);
            }
            label.visible = v;
        }
    }

    constructor(
        private world: PIXI.Container,
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