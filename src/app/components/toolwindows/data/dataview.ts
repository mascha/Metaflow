import {Component, Inject, ElementRef, HostListener} from '@angular/core';

let Plotly = require('plotly.js');

/**
 * Simulation run data analysis view.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'dataview',
    styles: [require('./dataview.scss')],
    template: `<div id="plot" class="plot"></div>`
})
export default class Dataview {

    static linspace(a,b,n) {
        if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
        if(n<2) { return n===1?[a]:[]; }
        var i,ret = Array(n);
        n--;
        for(i=n;i>=0;i--) { ret[i] = (i*b+(n-i)*a)/n; }
        return ret;
    }

    static getRandomArbitrary(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    ngAfterViewInit() {
        let boxNumber = 30;
        let boxColor = [];
        let allColors = Dataview.linspace(0, 360, boxNumber);
        let data = [];
        let yValues = [];

        for( var i = 0; i < boxNumber;  i++ ){
            var result = 'hsl('+ allColors[i] +',50%'+',50%)';
            boxColor.push(result);
        }

        for( var i = 0; i < boxNumber;  i++ ){
            var ySingleArray = [];
            for( var j = 0; j < 10;  j++ ){
                var randomNum = Dataview.getRandomArbitrary(0, 1);
                var yIndValue = 3.5*Math.sin(Math.PI * i/boxNumber) + i/boxNumber+(1.5+0.5*Math.cos(Math.PI*i/boxNumber))*randomNum;
                ySingleArray.push(yIndValue);
            }
            yValues.push(ySingleArray);
        }

        for(let i = 0; i < boxNumber; i++ ) {
            let result = {
                y: yValues[i],
                type:'box',
                marker:{
                    color: boxColor[i]
                }
            };
            data.push(result);
        }

        var layout = {
            xaxis: {
                showgrid: false,
                zeroline: false,
                tickangle: 60,
                showticklabels: false
            },
            yaxis: {
                zeroline: false,
                gridcolor: 'white'
            },
            paper_bgcolor: 'rgb(233,233,233)',
            plot_bgcolor: 'rgb(233,233,233)',
            showlegend:false,
            margin: {
                l: 0,
                b: 0,
                r: 0,
                t: 0
            }
        };


        Plotly.newPlot('plot', data, layout, {displayModeBar: false});
    }

    @HostListener('window:resize')
    onResize() {
        Plotly.Plots.resize(this.element.nativeElement.children[0]);
    }
    
    constructor(@Inject(ElementRef) private element: ElementRef) {
        // NOP
    }
}
