import {Component, Inject, ElementRef} from '@angular/core';

let Plotly = require('plotly.js');

/**
 * Simulation run data analysis view.
 * @author Martin Schade
 * @since 1.0.0
 */
@Component({
    selector: 'dataview',
    styles: [require('./dataview.scss')],
    template: ``
})
export default class Dataview {

    static getRandomArbitrary(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    ngAfterViewInit() {
        this.element.nativeElement.setId('plot');
        let boxNumber = 30;
        let boxColor = [];
        let allColors = numeric.linspace(0, 360, boxNumber);
        let data = [];
        let yValues = [];

//Colors

        for( var i = 0; i < boxNumber;  i++ ){
            var result = 'hsl('+ allColors[i] +',50%'+',50%)';
            boxColor.push(result);
        }
        
//Create Y Values

        for( var i = 0; i < boxNumber;  i++ ){
            var ySingleArray = [];
            for( var j = 0; j < 10;  j++ ){
                var randomNum = Dataview.getRandomArbitrary(0, 1);
                var yIndValue = 3.5*Math.sin(Math.PI * i/boxNumber) + i/boxNumber+(1.5+0.5*Math.cos(Math.PI*i/boxNumber))*randomNum;
                ySingleArray.push(yIndValue);
            }
            yValues.push(ySingleArray);
        }

//Create Traces

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

//Format the layout

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
            showlegend:false
        };


        Plotly.newPlot('plot', data, layout);
    }
    
    constructor(@Inject(ElementRef) private element: ElementRef) {
        // NOP
    }
}
