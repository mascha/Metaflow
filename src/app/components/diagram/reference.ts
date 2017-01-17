import {Camera} from '../../common/camera';
import {ViewGroup} from '../../common/viewmodel';
import {Diagram, Scope} from '../../common/layer';
import {Subject} from "rxjs/Subject";

/**
 * Diagram scope implementation.
 * 
 * Is responsible for maintaining the current level of reference, which is
 * a cursor within the viewmodel tree, allowing for lazy loading and infinite zooming.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export default class ScopeImpl extends Subject<ViewGroup> implements Scope {
    private _camera: Camera;
    private _limits: ClientRect;
    private _cachedGroups: Array<ViewGroup>;
    private _parent?: ViewGroup;
    private _current?: ViewGroup;
    readonly limits: ClientRect;

    get current(): ViewGroup { return this._current; };

    private adjustLimits(level: ViewGroup) {
        let adjustW = level.width * 0.9;
        let adjustH = level.height * 0.9;
        this._limits.right = level.left + level.width + adjustW;
        this._limits.left = level.left - adjustW;
        this._limits.top = level.top - adjustH;
        this._limits.bottom = level.top + level.height + adjustH; 
    }

    private cacheGroups(level?: ViewGroup) {
        this._cachedGroups = level ? level.contents.filter(it => !it.isLeaf()) as ViewGroup[] : [];
    }

    /**
     * Switches the reference level to the parent level.
     * If no parent is present, nothing will be done and the
     * camera stays the same.
     */
    private ascend() {
        if (!this._parent) {
            let parent = this._parent;
            let scope = this._current;
            let cam = this._camera;
            let wX = cam.worldX;
            let wY = cam.worldY;
            let cS = cam.scale;
            let rS = cS / parent.scale;
            let rX = (wX + scope.left) * cS;
            let rY = (wY + scope.top) * cS;
            this.loadLevel(parent);
            cam.zoomAndMoveTo(rX, rY, rS);
        }
    }

    /**
     * Switches downTo from the reference level to the child level.
     * If the given level is not a child of the current one, nothing
     * will be done.
     * 
     * @param target
     */
    private descendInto(target: ViewGroup) {
        let current = this._current, cam = this.diagram.camera;
        if (target && current && target.parent === current) {
            let wX = cam.worldX;
            let wY = cam.worldY;
            let cS = cam.scale;
            let rX = (wX - target.left * current.scale) * cS;
            let rY = (wY - target.top * current.scale) * cS;
            let rS = (cS * current.scale);
            this.loadLevel(target);
            cam.zoomAndMoveTo(rX, rY, rS);
        }
    }

    /**
     * Render the given viewmodel.
     * TODO rendering
     * TODO proxies
     * TODO caching, reuse previous elements
     * TODO accelerate
     * TODO event emitting
     * TODO move level rendering away from UI
     * TODO dynamic descent based on LOD-area
     * 
     * @param level
     */
    private loadLevel(level?: ViewGroup) {
        if (!level) return;
        this._current = level;
        this._parent = level.parent;
        this.cacheGroups(level);
        this.adjustLimits(level);
        this.next(level);
    }

    /*
     * TODO make this really fast!
     *  - Check content (groups, portals)
     *  - Acceleration structures, adaptive with item sizes
     *  - Only check visible objects of interest
     */
    private detectAndDoSwitch(): boolean {
        if (!this._current) return false;

        if (!this._parent) {
            if (this.isOutsideParent()) {
                this.ascend();
                return true;
            }
        }

        let groups = this._cachedGroups;
        if (!groups) return false;

        let len = groups.length;
        for (let i = 0; i < len; i++) {
            let group = groups[i];
            if (this.isWithinChildGroup(group)) {
                this.descendInto(group);
                return true;
            }
        }

        return false;
    }

    private isWithinChildGroup(group: ViewGroup): boolean {
        let scale = this._current.scale;
        let cam = this._camera;
        let pW = cam.projWidth;
        let pH = cam.projHeight;
        let wX = cam.worldX;
        let wY = cam.worldY;
        let gX = group.left * scale;
        let gY = group.top * scale;
        let gW = group.width * scale;
        let gH = group.height * scale;
        return (wX >= gX && wY >= gY &&
            wX + pW <= gX + gW &&
            wY + pH <= gH + gY);
    }

    private isOutsideParent(): boolean {
        let parent = this._parent;
        let cam = this._camera;
        let adjust = 0.6;
        let driftH = parent.width * adjust;
        let driftV = parent.height * adjust;
        return (cam.worldX < parent.left - driftH &&
            cam.worldY < parent.top - driftV &&
            cam.projWidth > parent.width + driftH &&
            cam.projHeight > parent.height + driftV);
    }

    constructor(private diagram: Diagram) {
        super();
        this._limits = { left: 2000, right: 2000, top: -2000, bottom: 2000, width: 4000, height: 4000 };
        this._camera = diagram.camera;
        diagram.model.subscribe(it => {
            if (it && it.root) this.loadLevel(it.root);
        });
    }
}
