import { Component, Renderer, ElementRef } from '@angular/core';
import HTML from "../../../../../common/utility";

@Component({
    selector: 'broadcast',
    template: require('./broadcast.html'),
    styles: [require('./broadcast.scss')]
})
export class Broadcast {

    private removeMove: Function;
    private removeUp: Function;

    pos = {
        x: 0,
        y: 0
    }
    
    private moveHandler = (event: MouseEvent) => {
        let elem = this.root.nativeElement;
        this.pos = HTML.getOffset(elem, event);
        this.renderer.setElementStyle(elem, "left", this.pos.x.toFixed(0));
        this.renderer.setElementStyle(elem, "top", this.pos.y.toFixed(0));
    };

    private upHandler = (event?: MouseEvent) => {
        this.removeMove();
        this.removeUp();
        HTML.block(event);
    };

    layers = [
        { name: "Nodes" },
        { name: "Edges" },
        { name: "Labels" }
    ];

    users = [
        { name: "Martin", status: "control" },
        { name: "Stefan", status: "away" },
        { name: "Renata", status: "idle" },
        { name: "Felix", status: "online" }
    ];

    private startDrag(event: MouseEvent) {
        let r = this.renderer;
        this.removeMove = r.listenGlobal('document', 'mousemove', this.moveHandler);
        this.removeUp = r.listenGlobal('document', 'mouseup', this.upHandler);
    }

    constructor(private renderer: Renderer, private root: ElementRef) {

    }
}