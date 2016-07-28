import {Camera} from '../../common/camera';
import {ViewGroup} from '../../common/viewmodel';
import Diagram from './diagram';

/**
 * ReferenceManager.
 * 
 * Is responsible for maintaining the current level of reference, which is
 * a cursor within the viewmodel tree, allowing for lazy loading and infinite zooming.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
class ReferenceManager {
    
    private camera: Camera;
    private current: ViewGroup;
    private diagram: Diagram;

    /**
     * Switches the reference level to the parent level.
     * If no parent is present, nothing will be done and the
     * camera stays the same.
     */
    private ascend() {
        if (!this.isRoot()) {
            let parent = this.getParent();
            let current = this.current;

            let wX = this.camera.worldX;
            let wY = this.camera.worldY;
            let cS = this.camera.scale;
            let rS = cS / parent.scale;
            let rX = (wX + current.left) * cS;
            let rY = (wY + current.top) * cS;

            this.loadLevel(parent);
            this.camera.zoomAndMoveTo(rX, rY, rS);
        }
    }

    /**
     * Switches downTo from the reference level to the child level.
     * If the given level is not a child of the current one, nothing
     * will be done.
     * @param target
     */
    private descendInto(target: ViewGroup) {
        let current = this.current;
        if (target && current && target.parent === current) {
            let wX = this.camera.worldX;
            let wY = this.camera.worldY;
            let cS = this.camera.scale;
            let rX = (wX - target.left * current.scale) * cS;
            let rY = (wY - target.top * current.scale) * cS;
            let rS = (cS * current.scale);

            this.loadLevel(target);
            this.camera.zoomAndMoveTo(rX, rY, rS);
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
     * @param level
     */
    private loadLevel(level: ViewGroup) {
        this.current = level;
        this.diagram.model = level;
        // this.limits.adjustTo(level);
    }

    /*
     * TODO make this really fast!
     *  - Check content (groups, portals)
     *  - Acceleration structures, adaptive with item sizes
     *  - Only check visible objects of interest
     */
    protected detectAndDoSwitch(): boolean {
        if (!this.current) {
            return false;
        }

        if (!this.isRoot()) {
            if (this.isOutsideParent()) {
                this.ascend();
                return true;
            }
        }

        let groups = this.diagram.cachedGroups;
        if (!groups) {
            return false;
        }

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

    private isRoot(): boolean {
        return (!this.current.parent);
    }

    private getParent(): ViewGroup {
        return this.current.parent as ViewGroup;
    }

    private isWithinChildGroup(group: ViewGroup): boolean {
        let scale = this.current.scale;
        let cam = this.camera;
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
        let parent = this.getParent();
        let cam = this.camera;
        let adjust = 0.6;
        let driftH = parent.width * adjust;
        let driftV = parent.height * adjust;
        return (cam.worldX < parent.left - driftH &&
            cam.worldY < parent.top - driftV &&
            cam.projWidth > parent.width + driftH &&
            cam.projHeight > parent.height + driftV);
    }
}