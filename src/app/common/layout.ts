import {ViewGroup, ViewVertex} from './viewmodel';

/**
 * General placement options.
 */
export const enum Locality {

    /**
     * Element takes place the space provided
     * by the parent element.
     */
    INSIDE,

    /**
     * Element may only be place on the border.
     */
    BORDER,
}

/**
 * Possible vertical alignment.
 */
export const enum VerticalAlignment {
    TOP, MIDDLE, BOTTOM
}

/**
 * Possible horizontal positions.
 */
export const enum HorizontalAlignment {
    LEFT, MIDDLE, RIGHT
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