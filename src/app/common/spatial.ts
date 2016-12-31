
/**
 * Spatial accelerator structure definition.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface SpatialStructure<T extends SpatialItem> {

    /**
     * Run a rectangular query against the spatial structure.
     */
    query(left: number, top: number, width: number, height: number, op: (T) => any);

    /**
     * Run a circular query against the spatial structure.
     */
    query(centerX: number, centerY: number, radius: number, op: (T) => any);

    /**
     * Find the nearest item, if any. Equivalent to calling findNearest 
     * with radius smaller or equal to zero. May return null.
     */
    nearest(centerX: number, centerY: number): T;

    /**
     * Rebuild the spatial database from scratch.
     */
    rebuild(source : Array<T>);

    /**
     * Update the database.
     */
    update();
}

/**
 * Spatial item interface definition.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export interface SpatialItem {
    left: number;
    top: number;
    width: number;
    height: number;
}

