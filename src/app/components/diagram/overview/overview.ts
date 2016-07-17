import {Component, ElementRef, ViewChild} from '@angular/core'

@Component({
    selector: 'overview',
    template: '<canvas #surface></canvas>',
    styles: [require('./overview.scss')]
})
export default class Overview {
    @ViewChild('surface') canvas: ElementRef;
    
    ngAfterViewInit() {
        let surface = this.canvas.nativeElement as HTMLCanvasElement;
        let brush = surface.getContext("2d");
        
        surface.width = 128;
        surface.height = 128;

        brush.fillStyle = 'cornflowerblue';

        let i = 25;
        while (i--) {
            brush.fillRect(
                2 + Math.random() * 124,
                2 + Math.random() * 124,
                2, 2
            )
        }

        brush.fillStyle = 'rgba(0,0,0,0.1)';
        brush.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        brush.fillRect(42, 25, 64, 28);
        brush.strokeRect(42, 25, 64, 28);
    }
}
