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
        {
            name : 'Processes',
            components : [
            'Source',
            'Sink',
            'Buffer',
            'Queue',
            'Processor',
            'Delay',
            'Conveyor',
            'Decision',
            'Split',
            'Join',
            'Merge',
            'Resource',
            'Hold',
            'Limiter',
            'Release',
            'Metric',
            'Measure']
        },
        {
            name: 'Manufacturing',
            components: []
        },
        {
            name: 'System Dynamics',
            components: []
        },{
            name: 'Supply Chain',
            components: []
        },{
            name: 'Pedestrians',
            components: []
        }
    ];

    getCategories(): Array<any> {
        return this.categories;
    }
}
