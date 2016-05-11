import {Injectable} from '@angular/core';

/**
 * Provides an entry point for retrieving all
 * registered palette collections.
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable()
export default class PaletteRegistry {

    private palettes = [
        'Processes',
        'Manufacturing',
        'System Dynamics',
        'Agents'
    ];

    getPalettes(): Array<string> {
        return this.palettes;
    }
}
