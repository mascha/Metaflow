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
    private items = [];
    private obs = new Array<SelectionObserver<T>>();

    getSelectedElements(): T[] {
        return this.items;
    }

    subscribe(observer: SelectionObserver<T>) {
        if (!observer) return;
        this.obs.push(observer);
    }

    setElements(items: T[]) {
        this.items = items;
        for(let i = 0, j = this.obs, l = j.length; i < l; i++) {
            j[i].onSelectionUpdate(this)
        }
    }
}