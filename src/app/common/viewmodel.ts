import {Style} from "./styling";

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
    
    isLeaf(): boolean {
        return true;
    }

    isProxy(): boolean {
        return false;
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
    style: Style;
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
    
    isProxy(): boolean {
        return true;
    }
}

/**
 * A view group acts as a styleable container
 * and decoration target for other view items.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class ViewGroup extends ViewVertex {

    isPortal: boolean = true;
    contents: Array<ViewVertex>;

    /**
     * Add a vertex to the group's contents.
     * @param vertex
     */
    addContent(vertex: ViewVertex) {
        vertex.parent = this;
        this.contents = this.contents || [];
        this.contents.push(vertex);
    }

    /**
     * Remove child or decoration.
     * @param vertex
     * @returns {boolean}
     */
    remove(vertex: ViewVertex): boolean {
        let contents = this.contents;
        if (!contents) return false; 

        const index = contents.indexOf(vertex);
        if (index > -1) {
            contents.splice(index, 1);
            if (contents.length < 1) {
                this.contents = undefined;
            }
            this.emit(ModelChange.ADD, vertex);
            return true;
        }
        
        return false;
    }

    isLeaf() {
        return false;
    }

    private emit(change: ModelChange, item) {
        // console.log(change);
    }

    constructor(name: string, x: number, y: number, w: number, h: number, public scale: number) {
        super(name,x,y,w,h);
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
    GEOMETRY = 0,

    /**
     * A style or styleable property has changed.
     */
    STYLING  = GEOMETRY + 1,

    /**
     * A child has been added.
     */
    ADD      = STYLING + 1,

    /**
     * A child has been removed.
     */
    REMOVE   = ADD + 1,
}