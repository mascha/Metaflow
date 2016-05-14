import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {FORM_PROVIDERS} from '@angular/common';

import Workspace from "./components/workspace/workspace";
import Navigation from "./components/navigation/navigation";

require('../style/globals.scss');

/**
 * Metalogic Web Application.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
  selector: 'app',
  providers: [...FORM_PROVIDERS],
  directives: [...ROUTER_DIRECTIVES, Workspace, Navigation],
  styles: [require('./app.scss')],
  template: require('./app.html')
})
export class App {
  NAME = "Metaflow";
  
  constructor() {
    document.title = this.NAME;
  }
}
