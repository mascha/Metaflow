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
    readonly rule: string;
    readonly origin: string;
    readonly style: Style;
}