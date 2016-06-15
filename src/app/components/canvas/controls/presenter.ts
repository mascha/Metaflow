import {Component} from '@angular/core';

/**
 * Diagramming overlay tools. 
 * @author Martin Schade    
 * @since 1.0.0
 */
@Component({
    selector: 'presenter',
    styles: [require('./presenter.scss')],
    template: require('./presenter.html')
})
export default class Presenter {
    active = true;
}
