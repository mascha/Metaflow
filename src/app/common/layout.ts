
/**
 * General placement options.
 */
export const enum Placement {
    INSIDE, BORDER, OUTSIDE
}

/**
 * Possible vertical positions.
 */
export const enum Vertical {
    TOP, MIDDLE, BOTTOM
}

/**
 * Possible horizontal positions.
 */
export const enum Horizontal {
    LEFT, MIDDLE, RIGHT
}

/**
 * Determines the degrees of freedom for decoration nodes.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum PlacementFreedom {
    /**
     * Can be placed anywhere.
     */
    FREE,

    /**
     * Can be placed anywhere on the border.  
     */ 
    SLIDING, 

    /**
     * Remains in place.
     */
    FIXED
}
