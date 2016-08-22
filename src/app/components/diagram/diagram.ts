import {Component, ElementRef, ViewChild, HostListener} from '@angular/core';
import {StateMachine, DiagramState, DiagramEvents} from "./behavior";
import {Camera} from "../../common/camera";
import {ViewGroup, ViewVertex} from "../../common/viewmodel";
import HTML from "../../common/utility";
import DiagramBehavior from './behavior';
import ModelService from "../../services/models";
import PlatformService from "../../services/platforms";
import Breadcrumbs from "./breadcrumbs/breadcrumbs";
import {PlatformLayer} from "../../common/platform";
import Overview from "./overview/overview";
import Presenter from "./controls/presenter";
import Loader from '../loader/loader';
import {Observable} from "rxjs/Rx";
import {GridLayer, BorderLayer, NodeLayer} from './layers';


/**
 * The diagram view component.
 * 
 * TODO panning & zoom limits, reset animation
 * TODO edges
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'diagram',
    template: require('./diagram.html'),
    styles: [require('./diagram.scss')],
    directives: [
        GridLayer, NodeLayer, BorderLayer,
        Breadcrumbs, Presenter, Overview,
        Loader
    ]
})
export default class Diagram {
    animatedZoom = false;
    animatedNavigation = true;
    frames = 60;
    rubberBanding = false;
    respectLimits = false;
    useKinetics = true;

    @ViewChild(BorderLayer) private _borderLayer: BorderLayer;
    @ViewChild(GridLayer) private _gridLayer: GridLayer;
    @ViewChild(NodeLayer) private _nodeLayer: NodeLayer;
    @ViewChild('effectLayer') private _effects: ElementRef;

    private _camera: Camera;
    private _behavior: DiagramEvents;
    private _inertiaDecay = 0.05;
    private _zoomPan = 1.99;
    private _velocity = .9;
    private _diagram: HTMLElement;
    private _model: ViewGroup;
    private _platform: PlatformLayer;

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
        if (this._platform) {
            this._platform.setModel(group);
        }
        if (this._behavior) {
            // this._behavior.setModel(group); TODO fix inifinite cycles!
        }
        if (this._borderLayer) {
            this._borderLayer.update(group);
        }
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

    get cachedGroups(): Array<ViewGroup> {
        return this._platform.cachedGroups;
    }

    /**
     * On click event handler.
     * @param event
     */
    @HostListener('dblclick', ['$event'])
    onDoubleClick(event: MouseEvent) {
        let off = HTML.getOffset(this._diagram, event);
        // this._behavior.handleClick(off.x, off.y, true);
        let n = Math.floor(this.model.contents.length * Math.random())
        let random = this.model.contents[n];
        this._behavior.handleNavigation(random);
        return false;
    }

    /**
     * On click event handler.
     * @param event
     */
    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        let off = HTML.getOffset(this._diagram, event);
        this._behavior.handleClick(off.x, off.y, false);
        return false;
    }

    /**
     * Keyboard event handler.
     * @param event
     */
    @HostListener('keyup', ['$event'])
    onKeyUp(event: KeyboardEvent) {
        this._behavior.handleKey(event);
        return false;
    }

    /**
     * Handle mouse wheel event.
     * @param event
     */
    @HostListener('wheel', ['$event'])
    onScroll(event: MouseEvent) {
        let off = HTML.getOffset(this._diagram, event);
        let sca = HTML.normalizeWheel(event);
        this._behavior.handleZoom(off.x, off.y, -sca * 20);
        return false;
    }

    /**
     * Handle resize events.
     */
    @HostListener('window:resize')
    onResize() {
        const rect = this._diagram.getBoundingClientRect();
        this._camera.updateVisual(0, 0, rect.width, rect.height);
    }

    /**
     * Handle mouse down/touch events
     * @param event
     */
    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        const pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseDown(pos.x, pos.y);
        HTML.block(event);
    }

    /**
     * Mouse movement.
     * @param event
     */
    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        const pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseMove(pos.x, pos.y);
        return false;
    }

    /**
     * Mouse up event.
     * @param event
     */
    @HostListener('mouseup', ['$event'])
    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        const pos = HTML.getOffset(this._diagram, event);
        this._behavior.handleMouseUp(pos.x, pos.y);
        return false;
    }

    /**
     * Assemble all canvas layers.
     */
    public ngAfterViewInit() {
        /* get html elements */
        this._diagram = this._element.nativeElement;
        let surface = this._nodeLayer.getElement();

        /* retrieve rendering platform */
        if (this._diagram) {
            this._platform = this._platforms.getPlatform(surface);
        } else {
            throw new Error('Could not find diagram DOM element');
        }

        /* link behavior state machine*/
        if (this._platform) {
            this._camera = this._platform.getCamera();
        } else {
            throw Error('Could not create rendering platform');
        }

        if (this._camera) {
            this._behavior = new DiagramBehavior(this);
        } else {
            throw new Error('Could not create camera instance');
        }

        /* attach all layers */
        if (this._behavior) {
            if (this._borderLayer) {
                this._borderLayer.observe(this._camera);
            }
            if (this._gridLayer) {
                this._gridLayer.observe(this._camera);
            }
            if (this._nodeLayer) {
                this._camera.attachObserver(this._platform);
            }
        } else {
            throw new Error('Could not create diagram controller');
        }

        /* load level data */
        this.model = this._models.getModel();

        /* do initial rendering */
        window.setTimeout(() => {
            this.onResize();
        }, 32)
    }

    constructor(private _platforms: PlatformService,
        private _models: ModelService,
        private _element: ElementRef) {
    }
}

/**
 * Responsible for handling level transition events and detection.
 * @author Martin Schade
 * @since 1.0.0
 */
class ReferenceManager {
    private current: ViewGroup;
}

export class CanvasSelection extends Observable<Array<ViewVertex>> {
    private items: ViewVertex[];

    setSelection(items: ViewVertex[]) {
        // TODO emit deselection
        // update internals
        // TODO emit selection
    }
}

function minimax(min: number, value: number, max: number) {
    if (max < min) { let temp = min; min = max; max = temp; }
    return (value < min) ? min : (value > max) ? max : value;
}