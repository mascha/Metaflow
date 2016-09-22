import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

/* Modules */
import DiagramModule from './components/diagram/diagram.module';
import WorkspaceModule from './components/workspace/workspace.module';

/* Components */
import Application  from './application';
import Timeline from "./components/timeline/timeline";
import Loader from './components/loader/loader';

/* Services */
import PlatformService from "./services/platforms";
import ModelService from "./services/models";
import PaletteRegistry from "./services/palettes";
import ConfigService from "./services/configs";
import ProjectService from "./services/projects";

/**
 * Main entrypoint for the application.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@NgModule({
  bootstrap: [Application],
  imports: [
    WorkspaceModule,
    DiagramModule,
    BrowserModule
  ],
  providers: [
    PlatformService, 
    ModelService,
    PaletteRegistry,
    ConfigService,
    ProjectService
  ],
  declarations: [
    Application, 
    Timeline,
    Loader
  ],
})
export default class AppModule {
  
}