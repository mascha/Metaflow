import { Component, Input } from '@angular/core';

/**
 * Timeline component.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
  selector: 'timeline',
  styles: [require('./timeline.scss')],
  template: require('./timeline.html')
})
export default class Timeline {
    @Input() title = "Market adption rate slows down?";
    
    titleExtra = "#94";

    comments = [
        {title: "TITLE"},
        {title: "TITLE"},
    ]
}