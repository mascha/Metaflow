import { Component } from '@angular/core';

/**
 * Controls for starting and stopping execution runs.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'playbar',
    template: require('./playbar.html'),
    styles: [require('./playbar.scss')]
})
export default class Playbar {

    private currentTime: string = '3:08';
    private maximumTime: string = '∞';
}