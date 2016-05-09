
/**
 * Style descriptor.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
abstract class Style {
    fill: string;
    opacity: number;
    border: string;
    borderWidth: number;
}

/**
 * A style descriptor for node items.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class NodeStyle extends Style {
    shape: any;
    prefWidth: number;
    prefHeight: number;
    resizeable: boolean;
    labelStyle: LabelStyle;
}

export class LabelStyle extends Style {
    label: string;
    fontSize: number;
    bold: boolean;
    underline: boolean;
    strikeout: boolean;
    placement: Placement;
    vertical: Vertical;
    horizontal: Horizontal;
}

/**
 * General placement options.
 */
export const enum Placement {
    INSIDE, BORDER, OUTSIDE
}

/**
 * Horizontal positions.
 */
export const enum Vertical {
    TOP, MIDDLE, BOTTOM
}

/**
 * Horizontal positions.
 */
export const enum Horizontal {
    LEFT, MIDDLE, RIGHT
}

/**
 * Determines the degrees of freedom for decoration nodes.
 */
export const enum PlacementFreedom {
    FREE, SLIDING, FIXED
}

/**
 * View model change types.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum ModelChange {
    POSITION = 0,
    STYLING  = 1,
    CHILDREN = 2,
    FILL     = 3,
    STROKE   = 4,
    SHAPE    = 5,
}


/**
 * @author Martin Schade
 * @since 1.0.0
 */
export class Label {
    text: string;
    lower: number;
    upper: number;
    priority: number;
    default: Label;
}

/**
 * Base viewmodel class. Supports decorations, styling positioning.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export abstract class ViewVertex {

    parent: ViewGroup;
    visual: any;
    
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
    style: Style;
}

/**
 * A proxy node is an unresolved item. 
 */
export class Proxy extends ViewVertex {
    request: string;
    level: number;
    path: string;
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
        if (!this.contents) {
            return false;
        }

        const index = this.contents.indexOf(vertex);
        if (index > -1) {
            this.contents.splice(index, 1);
            if (this.contents.length < 1) {
                this.contents = undefined;
            }
            return true;
        }
        
        return false;
    }

    constructor(l: string, x: number, y: number, w: number, h: number, public scale: number) {
        super(l,x,y,w,h);
    }
}
