import {Component} from '@angular/core';

/**
 * Main navigation bar.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'navigation',
    styles: [require('./navigation.scss')],
    template: require('./navigation.html'),
})
export default class Navigation {
    projectName = "Diffusion Model";
    favorite = false;
    showBranding = false;
    userName = 'Martin Schade';

    onFavoriteClick() {
        this.favorite = !this.favorite;
    }
}
