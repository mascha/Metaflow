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
 * A shape definition.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Shape {
    detailed: Array<number>;
    simple: Array<number>;
}


/**
 * A definition of a label.
 * Used as a blueprint for label instances.
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
    alignment: TextAlignment;
    color: number;
    fontSize: number;
    bold: boolean;
    placement: Placement;
    vertical: Vertical;
    horizontal: Horizontal;
    transform: TextTransform 
}

export const enum TextTransform {
    NONE = 0,
    LOWERCASE = NONE + 1,
    UPPERCASE = LOWERCASE + 1,
    CAPITALIZE = UPPERCASE + 1
}

export const enum TextAlignment {
    LEFT = 0,
    CENTER = LEFT + 1,
    RIGHT = CENTER + 1
}
