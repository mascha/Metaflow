import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'timeline',
  styles: [require('./timeline.scss')],
  template: require('./timeline.html')
})
export default class Timeline {
    title = "Timeline Title";
    titleExtra = "#94";

    comments = [
        {title: "TITLE"}
    ]
}