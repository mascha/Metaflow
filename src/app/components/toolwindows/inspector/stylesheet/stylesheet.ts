import { Component, Input } from '@angular/core';
import { Style, TextAlignment, TextTransform} from '../../../../common/styling';
import { Locality, Vertical, Horizontal } from '../../../../common/layout';

@Component({
    selector: 'stylesheet',
    template: require('./stylesheet.html'),
    styles: [require('./stylesheet.scss')]
})
export class StyleSheet {

    @Input() item: Style;

    alignmentToText(alignment: TextAlignment) {
        switch (alignment) {
            case TextAlignment.LEFT: return 'left';
            case TextAlignment.CENTER: return 'center';
            case TextAlignment.RIGHT: return 'right';
            default: return 'unknown';
        }
    }

    placementToText(alignment: Locality) {
        switch (alignment) {
            case Locality.INSIDE: return 'inside';
            case Locality.BORDER: return 'on border';
            case Locality.OUTSIDE: return 'outside';
            default: return 'unknown';
        }
    }

    horizontalToText(horizontal: Horizontal) {
        switch (horizontal) {
            case Horizontal.LEFT: return 'left';
            case Horizontal.CENTER: return 'center';
            case Horizontal.RIGHT: return 'right';
            default: return 'unknown';
        }
    }

    verticalToText(vertical: Vertical) {
        switch (vertical) {
            case Vertical.TOP: return 'top';
            case Vertical.MIDDLE: return 'middle';
            case Vertical.BOTTOM: return 'bottom';
            default: return 'unknown';
        }
    }

    transformToText(transform: TextTransform) {
        switch (transform) {
            case TextTransform.NONE: return 'none';
            case TextTransform.LOWERCASE: return 'lowercase';
            case TextTransform.UPPERCASE: return 'uppercase';
            case TextTransform.CAPITALIZE: return 'capitalize';
            default: return 'unknown';
        }
    }
  
}