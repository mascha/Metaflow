import {Style} from './styling';

/**
 * Concrete synatx class.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class ConcreteSyntax {
    readonly name;
    readonly mappings: Mapping[];
    readonly styles: Style[];
}

/**
 * A mapping from a source to the visual space.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Mapping {
    readonly rule: Rule;
    readonly style: Style;
    readonly type: MapType;
}

export class Category {
    constructor(
        readonly name: string,
        readonly components: Array<any>
    ) {}
}


/**
 * Enumeration of all possible mapping types.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export const enum MapType {

    /**
     * Map matched elements as a node entity. 
     */
    NODE,

    /**
     * Map matched elements as a node link.
     */
    LINK,

    /**
     * Map matched elements as a containment.
     */
    HIERARCHY,

    /**
     * Map matched elements as a decorator.
     */
    DECORATION
}

/**
 * Rule class.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Rule {
    readonly matcher: string;
    readonly query: string;
}


