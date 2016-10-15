import {Locality, HorizontalAlignment, VerticalAlignment} from './layout';
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
    private parent : Style;

    fill: number | string;
    stroke: number | string;
    opacity: number;
    borderWidth: number;
    margin: number;
    labels: Label | Label[];
    shape: Shape;
    defaultWidth: number;
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
        let result = new Style()
        return null;
    }

    private hasMultipleLabels(): boolean {
        return (this.labels && this.labels.constructor === Array);
    }
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
    lowerZoom: number;

    /**
     * The highest zoom level for which this 
     * label is visible.
     */
    upperZoom: number;
    
    /**
     * Priority used for visibility tie breaking.
     */
    priority: number;

    /**
     * The normal scale of the label.
     */
    baseScale: number;

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
     * Color of the text backdrop. Useful for
     * making labels stand out on maps.
     */
    backdrop: number;

    /**
     * Wether this label should be displayed
     * with a higher   
     */
    bold: boolean;

    /**
     * Where this label is going to be placed.
     */
    placement: Locality = Locality.INSIDE;

    /**
     * Vertical placement.
     */
    vertical: VerticalAlignment = VerticalAlignment.MIDDLE;

    /**
     * Horizontal placement.
     */
    horizontal: HorizontalAlignment = HorizontalAlignment.CENTER;

    /**
     * Text transform choice. Default is NONE.
     */
    transform: TextTransform;

    /**
     * Text alignment.
     */
    alignment: TextAlignment;

    /**
     * The cached platform type.
     */
    cache: any;
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
