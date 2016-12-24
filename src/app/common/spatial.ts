
/**
 * Spatial accelerator structure definition.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface SpatialStructure<T> {

    /**
     * Run a rectangular query against the spatial structure.
     */
    retrieve(left: number, top: number, width: number, height: number): Array<T>;

    /**
     * Run a circular query against the spatial structure.
     */
    retrieve(centerX: number, centerY: number, radius: number): Array<T>;

    /**
     * Find the nearest item, if any. May return null.
     */
    findNearest(centerX: number, centerY: number, radius: number): T;

    /**
     * Find the nearest item, if any. Equivalent to calling findNearest 
     * with radius smaller or equal to zero. May return null.
     */
    findNearest(centerX: number, centerY: number): T;

    /**
     * Rebuild the spatial database from scratch.
     */
    rebuild(source : Array<T>);

    /**
     * Update the database.
     */
    update();
}

