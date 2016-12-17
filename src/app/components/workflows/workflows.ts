
import { Component } from '@angular/core';


/**
 * A simple workflow component
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'workflow',
    template: require('./workflows.html'),
    styles: [require('./workflows.scss')]
})
export class Workflows {
    title = "This is where the workflow starts"

    inputItems = [
        'This is option A',
        'Another option',
        'Default'
    ]
 }