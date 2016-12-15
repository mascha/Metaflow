import {Locality, Horizontal, Vertical} from './layout';
import {Shape} from './shapes';

/**
 * Style descriptor.
 *
 * A style descriptor is used to provide a reusable
 * method of defining the visual appearance of component nodes.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class Style {

    /**
     * Filling color of the shape.
     */
    fill: number | string;

    /**
     * Stroke/border color of the shape.
     */
    stroke: number | string;

    /**
     * Width of the border stroke.
     */
    borderWidth: number;

    /**
     * How visible the shape is.
     */
    opacity: number;

    /**
     * Specifies the distance from the border
     * where items can be placed.
     */
    margin: number;

    /**
     * Label definitions.
     */
    labels: Label | Label[];

    /**
     * Shape descriptor.
     */
    shape: Shape;

    /**
     * 
     */
    defaultWidth: number;

    /**
     * 
     */
    defaultHeight: number;

    /**
     * The padding determines the space between the 
     * groups' boundary and its contents.
     */
    padding: number;

    /**
     * An image which acts as a simple rendering
     * of the style, which is useful for icons etc. 
     */
    cachedImage: HTMLCanvasElement;

    /**
     * The cached data url of the rendered style;
     */
    cachedURL: string;

    /**
     * Creates a new style which inherits it's
     * properties form a parent style.
     */
    static fork(style: Style): Style {
        if (!style) return style;
        return new Style(style);
    }

    private hasMultipleLabels(): boolean {
        return (this.labels && this.labels.constructor === Array);
    }

    constructor(private shadowed?: Style) {

    }
}

/**
 * A style describing an edge between 
 * a source and a target node.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class EdgeStyle extends Style {

    /**
     * The type of the edge.
     */
    edgeType: EdgeType;

    /**
     * Check wether the control points are derived automatically.
     */
    automaticRouting: boolean;
}

/**
 * The type of the edge.
 * 
 * @author Martin Schade    
 * @since 1.0.0
 */
export const enum EdgeType {

    /**
     * A line directly connecting source and target.
     * Represents the euclidean path between both points.
     */
    STRAIGHT,

    /**
     * A line which connects source and target by horizontal
     * and vertical line segments.
     */
    ORTHOGONAL,

    /**
     * A curve using a single control point.
     */
    QUADRATIC,

    /**
     * A curce using two control points.
     */
    CUBIC
}

/**
 * A GroupStyle acts as an extension to the 
 * simple styling behavior, encoding common
 * properties for groups and portals.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class GroupStyle extends Style {

    /**
     * Determines wether the boundary of the group
     * can act as a new reference level for the diagram,
     * switching when the camera moves completely inside 
     * the boundary.
     */
    actsAsPortal: boolean;
}

/**
 * A definition of a label.
 * 
 * Used as a blueprint from which 
 * label instances can be derived.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Label {

    /**
     * The lowest zoom level for which this
     * label is visible.
     */
    lowerScale: number = 0.01;

    /**
     * The highest zoom level for which this 
     * label is visible.
     */
    upperScale: number = 3.0;
    
    /**
     * Priority used for visibility tie breaking.
     */
    priority: number = 1.0;

    /**
     * The normal scale of the label.
     */
    baseScale: number = 1.0;

    /**
     * If all else fails, this is the 
     * text which will be rendered.
     */
    defaultText: string;

    /**
     * Text color.
     */
    color: number | string;
    
    /**
     * Color of the text halo. Useful for
     * making labels stand out on maps.
     */
    haloColor: number = 0xffffff;

    /**
     * Wether this label should be displayed
     * with a higher font weight. 
     */
    bold: boolean = false;

    /**
     * Where this label is going to be placed.
     */
    placement: Locality = Locality.INSIDE;

    /**
     * Vertical placement.
     */
    vertical: Vertical = Vertical.MIDDLE;

    /**
     * Horizontal placement.
     */
    horizontal: Horizontal = Horizontal.CENTER;

    /**
     * Text transform choice. Default is NONE.
     */
    transform: TextTransform = TextTransform.NONE;

    /**
     * Text alignment.
     */
    alignment: TextAlignment = TextAlignment.CENTER;

    /**
     * The cached platform type.
     */
    cache: any;

    /**
     * 
     */
    setScaling(lower: number, base: number, upper: number) {
        this.lowerScale = lower;
        this.upperScale = upper;
        this.baseScale = base;
    }
}

/**
 * Enumeration of all possible 
 * text transformations.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum TextTransform {
    NONE,        // as is
    LOWERCASE,   // everything small
    UPPERCASE,   // all bold letters
    CAPITALIZE,  // capitalize the first letter
}

/**
 * Enumeration of all possible
 * text alignments.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum TextAlignment {
    LEFT,
    CENTER,
    RIGHT
}
