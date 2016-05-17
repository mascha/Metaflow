import {Component} from '@angular/core';

/**
 * @author Martin Schade    
 * @since 1.0.0
 */
@Component({
    selector: 'presenter',
    styles: [require('./presenter.scss')],
    template: require('./presenter.html')
})
export default class Presenter {

    active = false;
    
    constructor() {
        setTimeout(()=> {
            this.active = true;
        }, 6000)
    }
}
