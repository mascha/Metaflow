import { Component, AfterViewInit } from '@angular/core';

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
export default class Application implements AfterViewInit {

  private fullscreen = false;

  ngAfterViewInit() {
    document.title = "Metalogic";
  }
}
