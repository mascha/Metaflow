import {Injectable} from '@angular/core';

/**
 * Provides an entry point for retrieving all
 * registered palette collections.
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable()
export default class PaletteRegistry {

    private categories = [
        'Processes',
        'Manufacturing',
        'System Dynamics',
        'Agents',
        'Supply Chain',
        'Petri Nets'
    ];

    getCategories(): Array<string> {
        return this.categories;
    }
}
