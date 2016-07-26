import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'timeline',
  styles: [require('./timeline.scss')],
  template: require('./timeline.html')
})
export default class Timeline {
    title = "Market adption rate slows down?";
    titleExtra = "#94";

    comments = [
        {title: "TITLE"},
        {title: "TITLE"},
    ]
}