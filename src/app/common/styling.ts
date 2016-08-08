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
export abstract class Style {
    private parent : Style;

    fill: number;
    opacity: number;
    borderWidth: number;
    margin: number;
    labels: LabelDefinition[];

    static fork(style: Style) {
        return null;
    }

    constructor(style?: Style) {
        this.parent = style;
    }
}

/**
 * A shape definition file akin to svg.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class ShapeDescriptor {
    detailed: any;
    simple: any;
    
    static DEFAULT: ShapeDescriptor;
}

/**
 * A style descriptor for node items.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class NodeStyle extends Style {
    shape: ShapeDescriptor;
    defaultWidth: number;
    defaultHeight: number;
    padding: number;
    margin: number;
    labelStyle: LabelStyle;

    constructor(config?: any) {
        super(config);
        this.shape = config.shape || ShapeDescriptor.DEFAULT;
    }
}

/**
 * A style which describes a label.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class LabelStyle extends Style {
    label: string;
    fontSize: number;
    bold: boolean;
    placement: Placement;
    vertical: Vertical;
    horizontal: Horizontal;
}


/**
 * A definition of a label.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class LabelDefinition {
    formula: () => string;
    lowerZoom: number;
    upperZoom: number;
    priority: number;
    baseScale: number;
    defaultText: string;
    color: number;
}
