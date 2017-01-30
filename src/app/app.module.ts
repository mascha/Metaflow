import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';

/* Modules */
import { WorkspaceModule } from './components/workspace/workspace.module';

/* Components */
import Application from './application';

/* Services */
import PlatformService from "./services/platforms";
import { API } from "./services/models";
import PaletteRegistry from "./services/palettes";
import { Settings } from './settings';

/**
 * Main entrypoint for the application.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@NgModule({
  bootstrap:      [ Application ],
  declarations:   [ Application ],
  imports:        [ WorkspaceModule, BrowserModule, HttpModule ],
  providers:      [ PlatformService, API, PaletteRegistry, Settings, 
                  { provide: 'apiURL', useValue: 'http://localhost:9000/api/v1' },
                  { provide: 'apiVER', useValue: '2017-1-1'} ],
})
export default class AppModule { 

}