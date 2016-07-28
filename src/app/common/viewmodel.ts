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
            return true;
        }
        
        return false;
    }

    isLeaf() {
        return false;
    }

    constructor(l: string, x: number, y: number, w: number, h: number, public scale: number) {
        super(l,x,y,w,h);
    }
}
