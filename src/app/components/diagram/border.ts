/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {CameraObserver, Camera} from '../../common/camera';
import {ViewVertex, ViewGroup} from "../../common/viewmodel";

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
    private proxies: Array<ViewVertex>;
    private scale = 1;

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
        this.proxies = group.contents;
        this.scale = group.scale;
    }

    private draw() {
        if (this.active && this.proxies) {
            this.clearProxies();
            this.drawBorder(0);
            this.drawProxies();
        }
    }

    /**
     * Draw the interactive border region.
     */
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

    /**
     * Draw all proxy items.
     */
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

        c.fillStyle = 'darkgrey';     
        c.globalAlpha = 1.0;

        let proxies = this.proxies;
        let len = proxies.length;
        for (let j = 0; j < len; j++) {
            let proxy = proxies[j];
            let x = (proxy.left + proxy.width * .5) * scale;
            let y = (proxy.top + proxy.height * .5) * scale;

            if (x > minX && x < wmX && y > minY && y < wmY) {
                continue; // ignore items within viewport
            } else if (x < miX || x > maX || y < miY || y > maY) {
                continue; // ignore items outside of interest
            }

            x -= cenX;
            y -= cenY;

            const distance = x * x + y * y
            if (distance > 1000000) {
                continue; // ignore items which are too far away
            }

            const A = a*y;
            const B = b*x;
            
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

            let drawX = Math.floor(this.halfW + pX - 8.0);
            let drawY = Math.floor(this.halfH + pY - 8.0);

            let cache = proxy.style.cachedImage;
            c.drawImage(cache, drawX, drawY);
        }
    }

    /*
     * Clears the proxies layer.
     */
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
