import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

/* Modules */
import { WorkspaceModule } from './components/workspace/workspace.module';

/* Components */
import Application  from './application';

/* Services */
import PlatformService from "./services/platforms";
import ModelService from "./services/models";
import PaletteRegistry from "./services/palettes";
import ProjectService from "./services/projects";

import {Settings} from './settings';

/**
 * Main entrypoint for the application.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@NgModule({
  bootstrap: [
    Application
  ],
  imports: [
    WorkspaceModule,
    BrowserModule
  ],
  providers: [
    PlatformService, 
    ModelService,
    PaletteRegistry,
    ProjectService,
    Settings
  ],
  declarations: [
    Application
  ],
})
export default class AppModule {}