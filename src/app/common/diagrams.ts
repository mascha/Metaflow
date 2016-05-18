/**
 * All possible diagram events.
 *  TODO make this more elegant!
 */
export interface DiagramEvents {
    handleClick(x: number, y: number, double: boolean)
    handleMouseDown(x: number, y: number)
    handleMouseMove(x: number, y: number)
    handleMouseUp(x: number, y: number)
    handleZoom(x: number, y: number, f: number)
    handleKey(event: KeyboardEvent)

    /**
     * Force the immediate cancellation of the current's states acitivites.
     * Mainly used for recovery of the state machinery.
     */
    handleAbort()

    /**
     * Notify the state that is should terminate, but does not need to.
     */
    handleStop()
}

/**
 * Diagram state definition.
 * @author Martin Schade
 * @since 1.0.0
 */
export interface DiagramState extends DiagramEvents {

    /**
     * Enter the state and execute it's initialization.
     * @param params Optional initialization parameters.
     */
    enterState(params?: any)

    /**
     * Exit the current state and perform cleanup.
     */
    leaveState()
}

/**
 * State machine interface.
 */
export interface StateMachine extends DiagramEvents {

    /**
     * Execute a state transition.
     * @param state
     * @param params
     */
    transitionTo(state: string, params?: any)

    /**
     * Reenter the current state with different or no parameters.
     */
    reenterState(params?: any)
}
