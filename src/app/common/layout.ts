import {ViewGroup, ViewVertex} from './viewmodel';

/**
 * General placement options.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum Locality {

    /**
     * Element takes place the space provided
     * by the parent element.
     */
    INSIDE = -1,

    /**
     * Element may only be placed on the border.
     */
    BORDER = 0,

    /**
     * Outside of the element.
     */
    OUTSIDE = 1
}

/**
 * Possible vertical alignment.
 */
export const enum Vertical {

    /**
     * 
     */
    TOP = -1,
    
    /**
     * 
     */
    MIDDLE = 0,
    
    /**
     * 
     */
    BOTTOM = 1
}

/**
 * Possible horizontal positions.
 */
export const enum Horizontal {
    
    /**
     * Leftmost position.
     */
    LEFT = -1,
    
    /**
     * Centered horizontally.
     */
    CENTER = 0, 

    /**
     * Rightmost position.
     */
    RIGHT = 1
}

/**
 * Determines the degrees of freedom for decoration nodes.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum Freedom {

    /**
     * Parent element is responsible for managing placement.
     */
    PARENT,

    /**
     * Element can be placed anywhere.
     */
    FREE,

    /**
     * Element remains in place.
     */
    FIXED,
}

/**
 * Describes all possible text orientations
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum TextAlignment {
    FLOAT_LEFT,
    FLOAT_RIGHT,
    CENTER,
    JUSTIFIED
}

/**
 * Layout algorithm.
 * 
 * @author Martin Schade.
 * @since 1.0.0
 */
export interface LayoutAlgorithm {
    apply(group: ViewGroup)
}

/**
 * Layout definition.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Layout {
    algorithm: LayoutAlgorithm;
}