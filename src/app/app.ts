import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FORM_PROVIDERS} from 'angular2/common';
import {Canvas} from './components/canvas/canvas.ts';
import '../style/app.scss';

/**
 * Metalogic Web Application
 */
@Component({
  selector: 'app',
  providers: [...FORM_PROVIDERS],
  directives: [...ROUTER_DIRECTIVES, Canvas],
  pipes: [],
  styles: [require('./app.scss')],
  template: require('./app.html')
})
export class App {
  constructor() {}
}
