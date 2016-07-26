import {Component} from '@angular/core';
import ConfigService from "./services/configs";
import {WorkspaceConfig} from "./services/configs";
import Workspace from "./components/workspace/workspace";
import Navigation from "./components/navigation/navigation";
import Toolbar from "./components/toolbar/toolbar";
import Diagram from "./components/diagram/diagram";
import Timeline from "./components/timeline/timeline";

require('../style/globals.scss');

/**
 * Metalogic Web Application.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
  selector: 'app',
  directives: [Workspace, Navigation, Toolbar, Diagram, Timeline],
  styles: [require('./app.scss')],
  template: require('./app.html')
})
export class App {

 private workspace: WorkspaceConfig;

 ngAfterViewInit() {
      document.title = this.config.getName();
 }
  
 constructor(private config: ConfigService) {
   this.workspace = config.getWorkspaceConfig();
  }
}
