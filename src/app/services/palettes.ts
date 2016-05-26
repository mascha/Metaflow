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
            components : [
                'Source',
                'Sink',
                'Buffer',
                'Merge',
                'Resource',
                'Hold',
                'Limiter',
                'Release',
                'Metric',
                'Measure']
        },
        {
            name: 'System Dynamics',
            components : [
                'Source',
                'Sink',
                'Buffer',
                'Queue',
                'Processor',
                'Delay']
        },{
            name: 'Supply Chain',
            components : [
                'Source',
                'Sink',
                'Buffer',
                'Queue',
                'Processor']
        },{
            name: 'Pedestrians',
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
        }
    ];

    getCategories(): Array<any> {
        return this.categories;
    }
}
