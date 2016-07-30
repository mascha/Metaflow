import {enableProdMode} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {HTTP_PROVIDERS} from '@angular/http';

const ENV_PROVIDERS = [];
if (process.env.ENV === 'build') {
  enableProdMode();
} else {
  // ENV_PROVIDERS.push(ELEMENT_PROBE_PROVIDERS);
}

import Application from './app/application';
import PlatformService from "./app/services/platforms";
import ModelService from "./app/services/models";
import PaletteRegistry from "./app/services/palettes";
import ConfigService from "./app/services/configs";
import ProjectService from "./app/services/projects";

const SERVICES = [
    PlatformService, 
    ModelService,
    PaletteRegistry,
    ConfigService,
    ProjectService
];

document.addEventListener('DOMContentLoaded', function main() {
  return bootstrap(Application, [
      SERVICES,
    ...HTTP_PROVIDERS,
    ...ENV_PROVIDERS
  ]).catch(error => {
      console.error('Could not start application!');
      console.error(error);
    });
});
