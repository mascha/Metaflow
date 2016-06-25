import {Component} from '@angular/core';
import {MenuBar} from "../menubar/menubar";

@Component({
    selector: 'navigation',
    styles: [require('./navigation.scss')],
    template: require('./navigation.html'),
    directives: [MenuBar]
})
export default class Navigation {
    
    projectName = "Diffusion Model";
    favorite = false;
    showBranding = true;
    userName = 'Martin Schade';
    showBraning = true;

    onFavoriteClick() {
        this.favorite = !this.favorite;
    }
}
