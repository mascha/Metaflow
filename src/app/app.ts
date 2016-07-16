import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {FORM_PROVIDERS} from '@angular/common';

import ConfigService from "./services/configs";
import {WorkspaceConfig} from "./services/configs";
import Workspace from "./components/workspace/workspace";
import Navigation from "./components/navigation/navigation";
import Toolbar from "./components/toolbar/toolbar";
import Diagram from "./components/diagram/diagram";

require('../style/globals.scss');

/**
 * Metalogic Web Application.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
  selector: 'app',
  providers: [...FORM_PROVIDERS],
  directives: [...ROUTER_DIRECTIVES, Workspace, Navigation, Toolbar, Diagram],
  styles: [require('./app.scss')],
  template: require('./app.html')
})
export class App {

  workspace: WorkspaceConfig;
  
  constructor(config: ConfigService) {
    this.workspace = config.getWorkspaceConfig();
    document.title = config.getName();
  }
}
