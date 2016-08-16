
/**
 * A shape definition from which 
 * shape instances can be derived. 
 * 
 * Shapes are always placed on their center coordinates.
 * Offsets are relative to the parents boundary.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Shape {
    x: number;
    y: number;
    a: number;
    b: number;
    type: ShapeType;
    
    constructor(type?: ShapeType) {
        this.type = type || ShapeType.CUSTOM;
    }

    static RECTANGLE = new Shape(ShapeType.RECTANGLE);
    static TRIANGLE = new Shape(ShapeType.TRIANGLE);
}

/**
 * A shape which consits of several subshapes.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class CompositeShape extends Shape {
    shapes : Array<Shape>

    constructor() {
        super(ShapeType.COMPOSITE);
    }
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
    ROUNDED,     // Rectangular shape with rounded corners (width, height, radius)
    CIRCLE,      // Circular shape (radius)
    ELLIPSE,     // Ellipsoid (width, height)
    DIAMOND,     // Diamond Shape (width, height)
    TRAPEZOID,   // Trapezoidal shape (width, height, topside)
    PARALLELOID, // Parallelogram (width, height, skew)
    HOURGLASS,   // Hourglass shape (width, height)
    ARC,         // Open circle (radius, angle)
    TRIANGLE     // Triangular shape (width, height)
}