import {Diagram} from '../../common/layer'

/**
 * A toolwindow.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface ToolWindow<T> {
    readonly title: string;

    initialize(diagram: T) 
}