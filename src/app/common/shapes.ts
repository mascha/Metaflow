
/**
 * A shape definition from which 
 * shape instances can be derived. 
 * 
 * Shapes are always placed on their center coordinates.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Shape {
    type : ShapeType;
    vertices: Array<number>;
    x: number
    y: number
    cache: any;
}

/**
 * A shape which consits of several subshapes.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class CompositeShape extends Shape {
    shapes : Array<Shape>
}

/**
 * Enumeration of possible shape types.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum ShapeType {
    NONE,        // No shape (none)
    CUSTOM,      // Defined by user
    COMPOSITE,   // Consits of several shapes, Unused
    ICON,        // Is an icon, Unused
    SQUARE,      // Square shape (width)
    RECTANGLE,   // Rectangular shape (width, height)
    CIRCLE,      // Circular shape (radius)
    ELLIPSE,     // Ellipsoid (width, height)
    DIAMOND,     // Diamond Shape (width, height)
    TRAPEZOID,   // Trapezoidal shape (width, height, topside)
    PARALLELOID, // Parallelogram (width, height, skew)
    HOURGLASS,   // Hourglass shape (width, height)
    ARC,         // Open circle (radius, angle)
}