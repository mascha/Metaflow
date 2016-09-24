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
    private projectName = "Diffusion Model";
    private favorite = false;
    private showBranding = true;
    private userName = 'Martin Schade';

    private onFavoriteClick() {
        this.favorite = !this.favorite;
    }
}
