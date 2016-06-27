import {NodeStyle} from "./styling";

/**
 * Base viewmodel class. Supports decorations, styling positioning.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export abstract class ViewVertex {
    parent: ViewGroup;
    visual: any;
    
    abstract isLeaf(): boolean;
    
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
    
    isLeaf() {
        return true;
    }
}

/**
 * A proxy node represents an unresolved item. 
 */
export class Proxy extends ViewVertex {
    request: string;
    level: number;
    path: string;
    
    isLeaf() {
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

    contents: Array<ViewVertex>;

    /**
     * 
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
