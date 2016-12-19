import {Style, EdgeStyle} from './styling';
import {Layout} from './layout';
import {Camera} from './camera';

/**
 * Base viewmodel class. 
 * 
 * Supports decorations, interaction and positioning.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export abstract class ViewVertex {
    parent?: ViewGroup;
    visual: any;
    labels: any;
    style: Style; 

    edges: ViewEdge<any>[];

    addLink(edge: ViewEdge<any>) {
        this.edges = this.edges || [];
        this.edges.push(edge);
    }
    
    isLeaf(): boolean {
        return true;
    }

    isProxy(): boolean {
        return false;
    }

    get centerX(): number { 
        return this.left + this.width * .5; 
    }
    
    get centerY(): number { 
        return this.top + this.height * .5; 
    }
    
    constructor(public name: string, public left: number,
                public top: number, public width: number,
                public height: number) {}
}

/**
 * A styleable, singular leaf node.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class ViewItem extends ViewVertex {
    
}

/**
 * A proxy node represents an unresolved item.
 *  
 * @author Martin Schade
 * @since 1.0.0
 */
export class ViewProxy extends ViewVertex {

    request: string;
    level: number;
    path: string;
    
    public isProxy(): boolean {
        return true;
    }
}

/**
 * A view group acts as a styleable container
 * and decoration target for other view items.
 * 
 * Furthermore it provides access to layouting facilities.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class ViewGroup extends ViewVertex {

    contents: Array<ViewVertex>;
    layout: Layout;

    /**
     * Add a vertex to the group's contents.
     * @param vertex
     */
    public addContent(vertex: ViewVertex) {
        if (!vertex) return;
        vertex.parent = this;
        this.contents = this.contents || [];
        this.contents.push(vertex);
        this.emit(ModelChange.CHILD_ADD, vertex);
    }

    /**
     * Remove child or decoration.
     * @param vertex
     * @returns {boolean}
     */
    public remove(vertex: ViewVertex): boolean {
        let contents = this.contents;
        if (!contents) return false; 

        const index = contents.indexOf(vertex);
        if (index > -1) {
            contents.splice(index, 1);
            if (contents.length < 1) {
                this.contents = undefined;
            }
            this.emit(ModelChange.CHILD_REMOVE, vertex);
            return true;
        }
        return false;
    }

    public isLeaf() {
        return false;
    }

    private emit(change: ModelChange, item) {

    }

    constructor(name: string, x: number, y: number, w: number, h: number, public scale: number) {
        super(name, x, y, w, h);
    }
}

/**
 * A graph edge that connects a source element
 * with it's target element.
 * 
 * @since 1.0.0
 * @author Martin Schade
 */
export class ViewEdge<T> {
    
    cache: T;

    constructor(
        public source: ViewVertex,
        public target: ViewVertex,
        public style: EdgeStyle,
    ) {}
}

/**
 * View model change types.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum ModelChange {

    /**
     * x,y,w,h,a,b changes
     */
    GEOMETRY,

    /**
     * The color has changed.
     */
    FILL,

    /**
     * A style or styleable property has changed.
     */
    STYLING,

    /**
     * A child has been added.
     */
    CHILD_ADD,

    /**
     * A child has been removed.
     */
    CHILD_REMOVE,
}

/**
 * A diagram layer.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface DiagramLayer {

    /**
     * A callback for registering camera movements.
     */
    observe(camera: Camera);

    /**
     * Update the internal or visual state with
     * a new view model.
     */
    update(group: ViewGroup);
}

/**
 * Main entry point for elements and viewpoints;
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class ViewModel {
    
    readonly statistics: ModelStatistics;

    constructor(readonly name: string, readonly root: ViewGroup) {}
}

export interface ModelStatistics {
    readonly elementCount: number;
    readonly sizeInMemory: number;
    readonly portalCount: number;
}