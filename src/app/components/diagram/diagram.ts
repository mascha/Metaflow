import { Component, ElementRef, ViewChild, HostListener, Renderer } from '@angular/core';
import { ViewNode, ViewModel } from "../../common/viewmodel";
import { Layer, RenderLayer, Diagram, Scope } from '../../common/layer';
import { Camera } from "../../common/camera";
import { Selection} from '../../common/selection';
import HTML from "../../common/utility";

/* Controller */
import {StateMachine } from "./behavior";
import DiagramBehavior from './behavior';
import ScopeImpl from './reference';

/* Components */
import { BorderLayer, GridLayer } from './layers/layers';
import {Overview} from './layers/overview/overview';
import {Presenter} from './layers/controls/presenter';
import {Breadcrumbs} from './layers/breadcrumbs/breadcrumbs';

/* Services */
import {ModelService} from "../../services/models";
import PlatformService from "../../services/platforms";

/* reactives */
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

/**
 * The diagram view component.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'diagram',
    template: require('./diagram.html'),
    styles: [require('./diagram.scss')],
})
export default class DiagramImpl implements Diagram {
    
    @ViewChild('NodeLayer') renderCanvas: ElementRef;
    @ViewChild(Breadcrumbs) breadcrumbs: Breadcrumbs;
    @ViewChild(Overview) overview: Overview;
    @ViewChild(Presenter) controls: Presenter;
    @ViewChild(BorderLayer) border: BorderLayer;
    @ViewChild(GridLayer) grid: GridLayer;

    private _scope: Scope;
    private _layers: Layer<Diagram>[];
    private _camera: Camera;
    private _behavior: StateMachine;
    private _inertiaDecay = 0.05;
    private _zoomPan = 1.99;
    private _velocity = .9;
    private _diagram: HTMLElement;
    private _model = new Subject<ViewModel>();
    private platform: RenderLayer<Diagram>;

    animatedZoom = false;
    animatedNavigation = true;
    rubberBanding = false;
    respectLimits = false;
    useKinetics = true;
    showClickEffect = true;

    readonly selection = new Selection<ViewNode>();
    readonly spatial = null;

    get layers(): Array<Layer<Diagram>> {
        return this.layers;
    }

    get scope(): Scope {
        return this._scope;
    }

    get camera(): Camera {
        return this._camera;
    }

    get inertiaDecay(): number {
        return this._inertiaDecay;
    }

    set inertiaDecay(value: number) {
        this._inertiaDecay = minimax(.001, value, .999);
    }

    get zoomPanPreference(): number {
        return this._zoomPan;
    }

    set zoomPanPreference(value: number) {
        this._zoomPan = minimax(.01, value, 2);
    }

    get model(): Observable<ViewModel> {
        return this._model;
    }

    get navigationVelocity(): number {
        return this._velocity;
    }

    set navigationVelocity(value: number) {
        this._velocity = minimax(.01, value, 3);
    }

    dispatchEvent(event: string, payload?: any) {
        this._behavior.handleEvent(event, payload);
    }

    @HostListener('keyup', ['$event'])
    onKeyUp(event: KeyboardEvent) {
        this._behavior.handleKey(event);
        return false;
    }

    @HostListener('wheel', ['$event'])
    onScroll(event: MouseEvent) {
        let off = HTML.getOffset(this._diagram, event);
        let sca = HTML.normalizeWheel(event);
        this._behavior.handleZoom(off.x, off.y, -sca * 20);
        return false;
    }

    @HostListener('window:resize')
    onResize() {
        const rect = this._diagram.getBoundingClientRect();
        this._camera.updateVisual(0, 0, rect.width, rect.height);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        const pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseDown(pos.x, pos.y);
        HTML.block(event);
        return false;
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        const pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseMove(pos.x, pos.y);
        return true;
    }

    @HostListener('mouseup', ['$event'])
    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        let pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseUp(pos.x, pos.y);
        return false;
    }

    ngAfterViewInit() {
        this._diagram = this.surface.nativeElement;

        if (this._diagram) {
            this.platform = this.platformService.initializeRenderer(
                this.renderCanvas.nativeElement
            );
            this._layers = [
                this.grid,
                this.platform,
                this.border,
                this.controls,
                this.breadcrumbs,
                this.overview
            ];
            this._camera = this.platform.camera;
            this._scope = new ScopeImpl(this);
            this._behavior = new DiagramBehavior(this);
            this._layers.forEach(it => it.initialize(this));
            this.modelService.fetchLevel("Debug Model","#").subscribe(model => {
                this._model.next(model);
                setTimeout(() => this.onResize());
            });
        } else {
            throw new Error('Could not find diagram DOM element');
        }
    }

    constructor(
        private platformService: PlatformService,
        private modelService: ModelService,
        private surface: ElementRef,
        private renderer: Renderer) {
            
    }
}

function minimax(min: number, value: number, max: number) {
    if (max < min) { let temp = min; min = max; max = temp; }
    return (value < min) ? min : (value > max) ? max : value;
}