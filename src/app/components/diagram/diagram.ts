import {Component, ElementRef, ViewChild, HostListener, ViewChildren} from '@angular/core';
import {ViewGroup, ViewVertex} from "../../common/viewmodel";
import {Camera} from "../../common/camera";
import HTML from "../../common/utility";

/* Controller */
import {StateMachine, DiagramState, DiagramEvents} from "./behavior";
import DiagramBehavior from './behavior';
import ReferenceManager from './reference';

/* Components */
import Loader from '../loader/loader';
import {DiagramLayer, PlatformLayer} from '../../common/layer';
import {NodeLayer} from './layers/layers';

/* Services */
import ModelService from "../../services/models";
import PlatformService from "../../services/platforms";

/**
 * The diagram view component.
 * 
 * @author Martin Schade
 * @since 0.1.0-alpha
 */
@Component({
    selector: 'diagram',
    template: require('./diagram.html'),
    styles: [require('./diagram.scss')],
})
export default class Diagram {
    animatedZoom = false;
    animatedNavigation = true;
    rubberBanding = false;
    respectLimits = false;
    useKinetics = true;
    showClickEffect = true;
    reference: ReferenceManager;

    @ViewChild(NodeLayer) private _nodeLayer: NodeLayer;
    @ViewChildren('') private _layers: Array<DiagramLayer>

    private _camera: Camera;
    private _behavior: DiagramEvents;
    private _inertiaDecay = 0.05;
    private _zoomPan = 1.99;
    private _velocity = .9;
    private _diagram: HTMLElement;
    private _model: ViewGroup;
    private _platform: PlatformLayer;
    private _isLoading = false;

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

    set model(group: ViewGroup) {
        this._model = group;
        this._layers.forEach(it => it.update(group))
    }

    get model(): ViewGroup {
        return this._model;
    }

    get navigationVelocity(): number {
        return this._velocity;
    }

    set navigationVelocity(value: number) {
        this._velocity = minimax(.01, value, 3);
    }

    private dispatchEvent(event: string, obj: MouseEvent) {
        let off = HTML.getOffset(this._diagram, obj);
        let lay = this._layers;
        let len = lay.length;
        let ret = false;
        /*
        while (!ret && len--) {
            lay[len].handleEvent(event, obj)
        }

        if (!ret) this._behavior.handle(event, obj);
        */
    }

    @HostListener('dblclick', ['$event'])
    private onDoubleClick(event: MouseEvent) {
        let off = HTML.getOffset(this._diagram, event);
        this._behavior.handleClick(off.x, off.y, true);  
        return false;
    }

    @HostListener('click', ['$event'])
    private onClick(event: MouseEvent) {
        let off = HTML.getOffset(this._diagram, event);
        this._behavior.handleClick(off.x, off.y, false);
        return false;
    }

    @HostListener('keyup', ['$event'])
    private onKeyUp(event: KeyboardEvent) {
        this._behavior.handleKey(event);
        return false;
    }

    @HostListener('wheel', ['$event'])
    private onScroll(event: MouseEvent) {
        let off = HTML.getOffset(this._diagram, event);
        let sca = HTML.normalizeWheel(event);
        this._behavior.handleZoom(off.x, off.y, -sca * 20);
        return false;
    }

    @HostListener('window:resize')
    private onResize() {
        const rect = this._diagram.getBoundingClientRect();
        this._camera.updateVisual(0, 0, rect.width, rect.height);
    }

    @HostListener('mousedown', ['$event'])
    private onMouseDown(event: MouseEvent) {
        const pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseDown(pos.x, pos.y);
        HTML.block(event);
        return false;
    }

    @HostListener('mousemove', ['$event'])
    private onMouseMove(event: MouseEvent) {
        const pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseMove(pos.x, pos.y);
        return true;
    }

    @HostListener('mouseup', ['$event'])
    // @HostListener('window:mouseup', ['$event'])
    private onMouseUp(event: MouseEvent) {
        let pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseUp(pos.x, pos.y);
        return false;
    }
    
    private ngAfterViewInit() {
        this._diagram = this._element.nativeElement;
        let surface = this._nodeLayer.getElement();

        if (this._diagram) {
            this._platforms.initializePlatform(surface).then(it => {
                this._platform = it;
                this._camera = it.getCamera();
                this._behavior = new DiagramBehavior(this);
                this._layers.forEach(it => it.observe(this._camera));
                this._isLoading = true;
                this._models.getModel().then(model => {
                    this.model = model; // use setter to update model
                    this.onResize()
                });
            });
        } else {
            throw new Error('Could not find diagram DOM element');
        }
    }

    constructor(
        private _platforms: PlatformService,
        private _models: ModelService,
        private _element: ElementRef) { }
}

function minimax(min: number, value: number, max: number) {
    if (max < min) { let temp = min; min = max; max = temp; }
    return (value < min) ? min : (value > max) ? max : value;
}