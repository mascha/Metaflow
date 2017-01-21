import { ViewNode } from './viewmodel';

/**
 * 
 */
export interface Violation {

    /**
     * 
     */
    item: string;
    
    /**
     * 
     */
    message: string;
}

/**
 * 
 */
export interface Constraint {

    /**
     * Whether this is an error, warning or info
     */
    type: string;

    /**
     * 
     */
    name: string;

    /**
     * 
     */
    violations: Array<Violation>;
}