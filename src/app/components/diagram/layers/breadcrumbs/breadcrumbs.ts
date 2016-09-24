import {Component, Input} from '@angular/core';
import {ViewGroup, ViewVertex} from "../../../../common/viewmodel";
import {Style} from "../../../../common/styling";
import ModelService from "../../../../services/models";

/**
 * A breadcrumbs breadcrumbs bar.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'breadcrumbs',
    styles: [require('./breadcrumbs.scss')],
    template: require('./breadcrumbs.html'),
})
export default class Breadcrumbs {

    private segments: Array<ViewGroup>;
    private placeholder: ViewGroup;
    
    @Input() private maximumSegments = 4; 

    setPath(group: ViewVertex) {
        let segments = [];

        while (group) {
            segments.push(group);
            group = group.parent;
        }
        
        if (segments.length > this.maximumSegments && this.maximumSegments > 2) {
            this.segments = [segments[0], this.placeholder, segments[segments.length-1]];
        } else {
            this.segments = segments.reverse();
        }
    }

    constructor(models: ModelService) {
        this.placeholder = new ViewGroup("...", 0,0,0,0,1);
        this.placeholder.style = new Style();
        this.placeholder.style.cachedURL = "";
        
        models.getModel().then((model) => {
            let subs = model.contents.filter((it, i, a) => !it.isLeaf())[0] as ViewGroup;
            let down = new ViewGroup("Europe",0,0,0,0,1);
            let down2 = new ViewGroup("Germany",0,0,0,0,1);
            down.style = subs.style;
            down2.style = subs.style;
            subs.addContent(down);
            down.addContent(down2);
            this.setPath(down2);
        })
    }
}
