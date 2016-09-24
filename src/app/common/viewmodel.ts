import {Style} from './styling';
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
    parent: ViewGroup;
    visual: any;
    labels: any;
    style: Style; 
    
    public isLeaf(): boolean {
        return true;
    }

    public isProxy(): boolean {
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
        vertex.parent = this;
        this.contents = this.contents || [];
        this.contents.push(vertex);
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
            this.emit(ModelChange.CHILD_ADD, vertex);
            return true;
        }
        return false;
    }

    public isLeaf() {
        return false;
    }

    private emit(change: ModelChange, item) {
        // console.log(change);
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
export class ViewEdge {
    source: ViewVertex;
    target: ViewVertex;
    style: Style;
}

/**
 * View model change types.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum ModelChange {

    /**
     * x,y,w,h changes
     */
    GEOMETRY,

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
 * A view model renderer.
 *
 * @author Martin Schade.
 * @since 1.0.0
 */
export interface ViewModelRenderer<I, G> {

    /**
     * Render a view item.
     */
    renderItem(item: ViewItem): I;

    /**
     * Render a view group.
     */
    renderGroup(group: ViewGroup, topLevel: boolean, oblique: boolean): G;

    /**
     * Attach node to scene.
     */
    attach(node: ViewVertex, group: ViewGroup)
}