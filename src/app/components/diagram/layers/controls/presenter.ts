import {Component, Input} from '@angular/core';
import {Layer, Diagram} from "../../../../common/layer";

/**
 * Diagramming overlay controls. 
 * 
 * @author Martin Schade    
 * @since 1.0.0
 */
@Component({
    selector: 'presenter',
    styles: [require('./presenter.scss')],
    template: require('./presenter.html'),
})
export class Presenter implements Layer<Diagram> {
    
    @Input() showControls = true;
    @Input() active = true;

    private diagram : Diagram;
    
    initialize(diagram: Diagram) {
        this.diagram = diagram;
        //this.layers = diagram.layers;
        diagram.model.subscribe(it => {
            this.showControls = (it && it.root) ? true : false;
        });
    }

    setActive(active: boolean) {
        this.active = active;
    }

    isActive() {
        return this.active;
    }

    onZoomIn(event: MouseEvent) {
        this.diagram.dispatchEvent('zoomIn');
    }

    onZoomOut(event: MouseEvent) {
        this.diagram.dispatchEvent('zoomOut');
    }

    onFitView(event: MouseEvent) {
        // 
    }
}
