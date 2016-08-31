/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {CameraObserver, Camera} from '../../common/camera';
import {ViewVertex, ViewGroup, ViewEdge} from "../../common/viewmodel";

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
    private region: HTMLCanvasElement;
    private brush: CanvasRenderingContext2D;
    private width  = -1;
    private height = -1;
    private halfH  = -1;
    private halfW  = -1;
    private maxW   = 0;
    private maxH   = 0;
    private border = 23;
    private middle = this.border * 0.5;
    private active = true;
    private proxies: Array<Proxy>;
    private scale = 1;

    get borderWidth(): number { return this.border; }

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

    showPreview(x: number, y: number): Array<ViewVertex> {
        const ps = this.proxies;
        if (ps && ps.length > 0) {
            const tol = 6;
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
            this.drawBorder(0);
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
        brush.strokeStyle = 'blue';
        brush.fillRect(0, 0, w, h);
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
        const miX = minX - 200;
        const miY = minY - 200;
        const wmX = minX + cam.projWidth;
        const wmY = minY + cam.projHeight;
        const maX = wmX + 200;
        const maY = wmY + 200;
        const a = this.halfW - this.middle;
        const b = this.halfH - this.middle;
        const c = this.brush;  
        const halfH = this.halfH;
        const halfW = this.halfW;

        c.fillStyle = 'darkgrey';     
        c.globalAlpha = 1.0;

        let proxies = this.proxies;
        let proxy = null;
        for (let i = 0, l = proxies.length; i < l; i++) {
            proxy = proxies[i];
            let x = proxy.x * scale;
            let y = proxy.y * scale;

            if (x > minX && x < wmX && y > minY && y < wmY) {
                proxy.pX = -1000; proxy.pY = -1000;
                continue; // ignore items within viewport
            } else if (x < miX || x > maX || y < miY || y > maY) {
                proxy.pX = -1000; proxy.pY = -1000;
                continue; // ignore items outside of interest
            }

            x -= cenX;
            y -= cenY;

            const distance = x * x + y * y
            if (distance > 1000000) {
                continue; // ignore items which are too far away
            }

            const A = a * y;
            const B = b * x;
            
            let pX = 0, pY = 0;
            if (Math.abs(A) <= Math.abs(B)) {
                if (x < 0) {
                    pY = -A / x;
                    pX = -a;
                } else if (x > 0) {
                    pY = A / x;
                    pX = a;
                }
            } else {
                if (y < 0) {
                    pX = -B / y;
                    pY = -b;
                } else if (y > 0) {
                    pX = B / y;
                    pY = b;
                }
            }

            let drawX = Math.floor(halfW + pX - 8.0);
            let drawY = Math.floor(halfH + pY - 8.0);
            proxy.pX = drawX;
            proxy.pY = drawY;
            proxy.image = proxy.image || proxy.origin.style.cachedImage;

            c.drawImage(proxy.image, drawX, drawY);
        }
    }

    private clearProxies() {
        this.brush.clearRect(
            0.0, 0.0,
            this.region.width,
            this.region.height
        );
    }

    private updateCache() {
        this.width  = Math.ceil(this.camera.visualWidth);
        this.height = Math.ceil(this.camera.visualHeight);
        this.halfW  = this.width * .5;
        this.halfH  = this.height * .5;
        this.middle = this.border * .5;
        this.maxW   = this.width - this.middle;
        this.maxH   = this.height - this.middle;
        this.region.width = this.width;
        this.region.height = this.height;
    }

    constructor(private camera: Camera, region: HTMLCanvasElement) {
        this.region = region;
        this.brush = region.getContext('2d');
    }
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
    origin: ViewVertex;
    links: ViewEdge[];

    constructor(item: ViewVertex) {
        this.origin = item;
        this.x = item.left + item.width * 0.5;
        this.y = item.top + item.height * 0.5;
    }
}