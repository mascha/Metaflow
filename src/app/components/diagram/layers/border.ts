
import {CameraObserver, Camera} from '../../../common/camera';
import {ViewNode, ViewGroup, ViewEdge} from "../../../common/viewmodel";

/**
 * Interactive region border region. This class is responsible for projection
 * and clustering of proxies according to their position and parameters
 * of the area of influence.
 *
 * Proxies with attached edges are always rendered in the foreground
 * above other proxies, are never aggregated in clusters
 * and have a darker border color than proxies with no edges
 *
 * @property distance Depending on the adaptivity style, the distance represents a fixed area around the viewport.
 * @property adaptivity The adaptivity of the influence region.
 * @property proxyStyle The visualization style of the proxy items.
 * @property clusterDimension The dimension of clustered proxies.
 * @property clusteringStrategy Determines the style in which multiple overlapping proxy nodes will be displayed.
 * @property projectionStrategy [ProjectionStrategy] for nodes which are out of view.
 * @property edgeRoutingStrategy Style of the edge routing applied to connections.
 *
 * @since 1.0.0
 * @author Martin Schade
 */
export default class Border implements CameraObserver {
    private brush: CanvasRenderingContext2D;
    private width  = -1;
    private height = -1;
    private halfH  = -1;
    private halfW  = -1;
    private maxW   = 0;
    private maxH   = 0;
    private border = 23;
    private middle = this.border * 0.5;
    active = true;
    private proxies: Array<Proxy>;
    
    private top: Array<Proxy>; 
    private bot: Array<Proxy>;
    private left: Array<Proxy>;
    private right: Array<Proxy>;
    
    private tops: Array<number>;
    private rights: Array<number>;
    private lefts: Array<number>;
    private bots: Array<number>;
    private counts: Array<number>;

    private clusterSize = 4; // 3+
    private granularity = 16; // each 16px 

    private scale = 1;

    get borderWidth() { 
        return this.border; 
    }

    onViewResized(): void {
        this.updateCache();
        this.draw();
    }

    onPanChanged(posX: number, posY: number): void {
        this.draw();
    }

    onZoomChanged(zoom: number): void {
        this.draw();
    }

    updateProxies(group: ViewGroup) {
        if (!group) return;
        this.scale = group.scale;
        let items = group.contents || [];
        this.proxies = new Array<Proxy>(items.length);
        for (let i = 0, len = items.length; i < len; i++) {
            this.proxies[i] = new Proxy(items[i]);
        }
    }

    showPreview(x: number, y: number): Array<ViewNode> {
        const ps = this.proxies;
        if (ps && ps.length > 0) {
            const tol = 36;
            const result = [];
            let hit : Proxy = null;
            for (let i = 0, l = ps.length; i < l; i++) {
                hit = ps[i];
                if (hit.pX - tol < x && x < hit.pX + tol && hit.pY - tol < y && y < hit.pY + tol) {
                    result.push(hit.origin);
                }
            }            
            return result;
        }
    }

    private draw() {
        if (this.active && this.proxies) {
            this.clearProxies();
            this.drawBorder(0.1);
            this.drawProxies();
        }
    }

    private drawBorder(alpha: number) {
        if (alpha <= 0) return; 
        const brush = this.brush;
        const w = this.camera.visualWidth;
        const h = this.camera.visualHeight;
        const b = this.border;
        brush.globalAlpha = alpha;
        brush.fillStyle = 'black';
        brush.strokeStyle = 'black';
        brush.fillRect(0, 0, w, h);
        brush.globalAlpha = alpha * 2;
        brush.strokeRect(b, b, w - 2*b, h - 2*b);
        brush.clearRect(b, b, w - 2*b, h - 2*b);
    }

    private drawProxies() {
        const cam = this.camera;
        const scale = this.scale;
        const cenX = cam.centerX;
        const cenY = cam.centerY;
        const minX = cam.worldX;
        const minY = cam.worldY;
        const wmX = minX + cam.projWidth;
        const wmY = minY + cam.projHeight;
        const aoiLeft = minX - 2000 * scale;
        const aoiTop = minY - 2000 * scale;
        const aoiRight = wmX + 2000 * scale;
        const aoiLow = wmY + 2000 * scale;
        const a = this.halfW - this.middle;
        const b = this.halfH - this.middle;
        const c = this.brush;  
        const halfH = this.halfH;
        const halfW = this.halfW;

        c.fillStyle = 'darkgrey';     
        c.globalAlpha = 1.0;

        let proxies = this.proxies;
        let proxy = null, x, y;
        for (let i = 0, l = proxies.length; i < l; i++) {
            proxy = proxies[i];
            x = proxy.x * scale;
            y = proxy.y * scale;

            if (x < aoiLeft || x > aoiRight || y < aoiTop || y > aoiLow) {
                continue; // ignore items outside of area
            } else if (x > minX && x < wmX && y > minY && y < wmY)  {
                continue; // ignore items inside viewport
            }

            x -= cenX;
            y -= cenY;

            const distance = x*x + y*y
            if (distance > 1000000) {
                continue; // ignore items which are too far away
            }

            const A = a * y;
            const B = b * x;

            let pX = 0, pY = 0, dir = Direction.NONE, id = 0;

            if (Math.abs(A) <= Math.abs(B)) {
                if (x < 0) {
                    pY = -A / x;
                    pX = -a;
                    dir = Direction.LEFT; 
                } else if (x > 0) {
                    pY = A / x;
                    pX = a;
                    dir = Direction.RIGHT;
                }
            } else {
                if (y < 0) {
                    pX = -B / y;
                    pY = -b;
                    dir = Direction.TOP;
                } else if (y > 0) {
                    pX = B / y;
                    pY = b;
                    dir = Direction.BOTTOM;
                }
            }

            let drawX = (halfW + pX - 8) | 0;
            let drawY = (halfH + pY - 8) | 0;

            proxy.pX = drawX;
            proxy.pY = drawY;
            proxy.image = proxy.image || proxy.origin.style.cachedImage;

            c.drawImage(proxy.image, drawX, drawY);
        }
    }

    private clearProxies() {
        let r = this.region;
        this.brush.clearRect(0, 0, r.width, r.height);
    }

    private updateCache() {
        /* border variable cache */
        this.width  = Math.ceil(this.camera.visualWidth);
        this.height = Math.ceil(this.camera.visualHeight);
        this.halfW  = this.width * .5;
        this.halfH  = this.height * .5;
        this.middle = this.border * .5;
        this.maxW   = this.width - this.middle;
        this.maxH   = this.height - this.middle;
        this.region.width = this.width;
        this.region.height = this.height;

        /* cluster caches */
        const cWidth = Math.floor(this.width / this.granularity);
        const cHeight = Math.floor(this.height / this.granularity);
        this.tops = new Array<number>(this.clusterSize * cWidth);
        this.bots = new Array<number>(this.clusterSize * cWidth);
        this.rights = new Array<number>(this.clusterSize * cHeight);
        this.lefts = new Array<number>(this.clusterSize * cHeight);
        this.counts = new Array<number>(this.clusterSize * 2 * (cWidth + cHeight))
    }

    constructor(private camera: Camera, private region: HTMLCanvasElement) {
        this.brush = region.getContext('2d');
    }
}

/**
 * Direction indication
 */
const enum Direction {
    NONE = 0,
    TOP = 1,
    LEFT = 2,
    RIGHT = 3,
    BOTTOM = 4
}

/**
 * Internal cache class used for speedily accessing
 * links and projected coordinates within the border region.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
class Proxy {
    x: number;
    y: number;
    pX: number;
    pY: number;
    image: HTMLCanvasElement;
    cluster: number;
    origin: ViewNode;
    links: ViewEdge[];
    direction: Direction;

    public reuse(item: ViewNode) {
        this.origin = item;
        this.x = item.centerX
        this.y = item.centerY
        this.image = item.style.cachedImage;
    }

    constructor(item: ViewNode) {
        this.reuse(item);
    }
}