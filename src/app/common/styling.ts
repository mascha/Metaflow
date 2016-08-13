import {Placement, Horizontal, Vertical} from './layout';

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

    styleId: string;
    fill: number | string;
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
    cachedImage: any;

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

    constructor(style?: Style) {
        this.parent = style;
        this.styleId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        }); 
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
    formula: () => string;
    lowerZoom: number;
    upperZoom: number;
    priority: number;
    baseScale: number;
    defaultText: string;
    color: number;
    fontSize: number;
    fontWeight: boolean;
    placement: Placement;
    vertical: Vertical;
    horizontal: Horizontal;
    transform: TextTransform;
    alignment: TextAlignment;
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
