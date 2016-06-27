import {
    Style, NodeStyle, LabelStyle, Vertical, Placement, Horizontal, ShapeDescriptor
} from "../common/styling";

const VARIABLE = new NodeStyle({
    fill : 1,
    stroke: 0,
    shape: new ShapeDescriptor(),
    padding: 4,
    margin: 10,
    labels: [
        new LabelStyle(),
        new LabelStyle(),
        new LabelStyle(),
    ],
});

/**
 * Hard-coded system dynamics styles.
 * @type {Array}
 */
export const SYSDYN_STYLES : Array<Style> = [
    VARIABLE,
];
