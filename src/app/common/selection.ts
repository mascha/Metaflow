/**
 * Selection observer interface.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface SelectionObserver<T> {

    /**
     * Called when selection starts. Should finish quickly.
     */
    onSelectionBegin(selection: Selection<T>);

    /**
     * Called when selection was updated, i.e when 
     * elements are added to the selection array.
     */
    onSelectionUpdate(selection: Selection<T>);
}

/**
 * Observable multiple-selection model.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Selection<T> {
    readonly items = [];
    private obs = new Array<SelectionObserver<T>>();

    get empty(): boolean {
        return (this.items && this.items.length > 0)
    }

    public subscribe(observer: SelectionObserver<T>) {
        if (!observer) return;
        this.obs.push(observer);
    }
}