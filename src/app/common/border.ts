/*
 * Copyright (C) Martin Schade, 2015-2016. All rights reserved.
 */

import {ICameraObserver, Camera} from './camera';

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
export default class Border implements ICameraObserver {
    private camera: Camera;
    private region: HTMLCanvasElement;
    private brush: CanvasRenderingContext2D;
    private width  = -1.0;
    private height = -1.0;
    private halfH  = -1.0;
    private halfW  = -1.0;
    private maxW   = 0.0;
    private maxH   = 0.0;
    private border = 16.0;
    private middle = this.border / 2;
    private active = true;
    private proxies: Array<Proxy>;

    onViewResized(): void {
        this.clearProxies();
        this.updateCache();
        this.draw();
    }

    /*
     * Only redraw proxies.
     */
    onPanChanged(posX: number, posY: number): void {
        this.clearProxies();
        this.draw();
    }

    /*
     * Only redraw proxies.
     */
    onZoomChanged(zoom: number): void {
        this.clearProxies();
        this.draw();
    }

    private draw() {
        if (this.active) {
            this.drawBorder(0.1);
            this.drawProxies();
        }
    }

    /**
     * Draw the interactive border region.
     */
    private drawBorder(alpha: number) {
        const brush = this.brush;
        const w = this.camera.visualWidth;
        const h = this.camera.visualHeight;
        const b = this.border;
        brush.globalAlpha = alpha;
        brush.fillStyle = 'black';
        brush.fillRect(0, 0, w, h);
        brush.clearRect(b, b, w - b * 2.0, h - b * 2.0);
    }

    /**
     * Draw all proxy items.
     * TODO draw labels
     *
     */
    private drawProxies() {
        const cam = this.camera;
        const cenX = cam.centerX;
        const cenY = cam.centerY;
        const minX = cam.worldX;
        const minY = cam.worldY;
        const maxX = minX + cam.projectedWidth;
        const maxY = minY + cam.projectedHeight;
        const a = this.halfW - this.middle;
        const b = this.halfH - this.middle;
        const c = this.brush;
        
        c.fillStyle = 'mediumseagreen';
        c.strokeStyle = 'lightgrey';
        c.globalAlpha = 1.0;

        let proxies = this.proxies;
        let len = proxies.length;

        for (let j = 0; j < len; j += 2) {
            let proxy = proxies[j];
            let x = proxy.x;
            let y = proxy.y;

            if (x > minX && x < maxX && y > minY && y < maxY)
                continue;

            x -= cenX;
            y -= cenY;

            const A = a*y;
            const B = b*x;
            
            let pX = 0, pY = 0;
            if (Math.abs(A) <= Math.abs(B)) {
                if (x < 0) {
                    pX = -a;
                    pY = -A/x;
                } else if (x > 0) {
                    pX = a;
                    pY = A/x;
                }
            } else {
                if (y < 0) {
                    pX = -B/y;
                    pY = -b;
                } else if (y > 0) {
                    pX = B/y;
                    pY = b;
                }
            }

            c.fillRect(
                this.halfW + pX - 3.0,
                this.halfH + pY - 3.0,
                6, 6
            );
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
        this.width  = this.camera.visualWidth;
        this.height = this.camera.visualHeight;
        this.halfW  = this.width / 2.0;
        this.halfH  = this.height / 2.0;
        this.middle = this.border / 2.0;
        this.maxW   = this.width - this.middle;
        this.maxH   = this.height - this.middle;
        this.region.width = this.width;
        this.region.height = this.height;
    }

    constructor(camera: Camera, region: HTMLCanvasElement) {
        this.region = region;
        this.brush = region.getContext('2d');
        this.camera = camera;
        this.proxies = new Array(250);

        let proxies = this.proxies;
        let len = proxies.length;
        for (var i = 0; i < len; i++) {
            const x = (0.5 - Math.random()) * 2000;
            const y = (0.5 - Math.random()) * 2000;
            proxies[i] = new Proxy(x, y);
        }
    }
}

/**
 * Proxy data.
 *
 * @author Martin Schade.
 * @since 1.0.0
 */
class Proxy {
    constructor(public x: number, public y: number) {}
} 
