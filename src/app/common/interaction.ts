/**
 * Describes interaction criteria.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Interaction {

    constructor(public resizeable = false,
                public draggable = true,
                public selectable = true,
                public hoverable = true,
                public descendable = false) {}

    static GROUP_INTERACTION = new Interaction(
        true, true, true, false, true
    );

    static NODE_INTERACTION = new Interaction(
        true, true, true, false, false
    )
}
