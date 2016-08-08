import {NodeStyle} from "./styling";

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
    
    isLeaf(): boolean {
        return true;
    }

    isProxy(): boolean {
        return false;
    }
    
    constructor(public label: string, public left: number,
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
    style: NodeStyle;
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
        if (!contents) { return false; }

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

    constructor(l: string, x: number, y: number, w: number, h: number, public scale: number) {
        super(l,x,y,w,h);
    }
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
     * 
     */
    REMOVE   = ADD + 1,

    FILL     = REMOVE + 1,

    STROKE   = FILL + 1,

    SHAPE    = STROKE + 1,

    LABEL    = SHAPE + 1,
    
    ZOOM     = LABEL + 1,
}