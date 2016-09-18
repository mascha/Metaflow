import {Component} from '@angular/core';
import ConfigService from "./services/configs";
import {WorkspaceConfig} from "./services/configs";

require('../style/globals.scss');

/**
 * Metalogic Web Application.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
  selector: 'application',
  styles: [require('./application.scss')],
  template: require('./application.html')
})
export default class Application {

 private workspace: WorkspaceConfig;

 ngAfterViewInit() {
      document.title = this.config.getName();
 }
  
 constructor(private config: ConfigService) {
   this.workspace = config.getWorkspaceConfig();
  }
}
