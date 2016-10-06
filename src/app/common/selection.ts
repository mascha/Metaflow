/**
 * Selection observer interface.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface SelectionObserver<T> {
    onSelectionBegin(selection: Selection<T>)
    onSelectionUpdate(selection: Selection<T>)
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

    public getSelectedElements(): T[] {
        return this.items;
    }

    public isEmpty(): boolean {
        return (this.items && this.items.length > 0);
    }

    public subscribe(observer: SelectionObserver<T>) {
        if (!observer) return;
        this.obs.push(observer);
    }
}