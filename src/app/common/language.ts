import { Style } from './styling';

/**
 * Represents a modelling language.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Language {
    constructor(
        readonly name: string,
        readonly syntax: ConcreteSyntax,
        readonly mapping: Mapping) 
    { }
}

/**
 * Concrete syntax class.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class ConcreteSyntax {
    constructor(readonly styles: Array<Style>) { }
}

/**
 * A mapping from the abstract to the concrete syntax.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Mapping {
    constructor(
        readonly namespace: string,
        readonly rules: Array<Rule>
    )
    { }
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
    constructor(
        readonly matcher: string,
        readonly style: string,
        readonly type: MapType
    )
    { }
}


/**
 * Palette category.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Category {
    constructor(
        readonly name: string,
        readonly components: Array<any>
    ) { }
}
