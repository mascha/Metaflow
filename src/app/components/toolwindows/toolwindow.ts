import {Diagram} from '../../common/layer'

/**
 * A toolwindow.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface ToolWindow {
    readonly title: string;

    initialize(diagram: Diagram) 
}