import { Component, Input } from '@angular/core';
import { Style } from '../../../../common/styling';

@Component({
    selector: 'stylesheet',
    template: require('./stylesheet.html'),
    styles: [require('./stylesheet.scss')]
})
export class StyleSheet {

    @Input() item: Style;
  
}