import { Injectable } from "@angular/core";
import { ViewGroup, ViewItem, ViewEdge, ViewModel, ViewNode, ViewProxy } from "../common/viewmodel";
import { Language, ConcreteSyntax, Mapping, Rule, MapType } from "../common/language";
import { Style, GroupStyle, EdgeStyle, Label, TextAlignment } from '../common/styling';
import { Shape, Shapes } from '../common/shapes';
import { Vertical, Horizontal, Locality } from '../common/layout';
import { Mapper } from '../platform/render';
import { Observable } from "rxjs/Observable";

const NAMES = [
    'Population',
    'Market Size',
    'Price',
    'Stock',
    'Very long name',
    'Work in\nProgress',
    'Deliverables',
    'Workforce',
    'Customers',
    'Prospects',
    'Market Growth',
    'Ramp Up',
    'Projects',
    'Delayed Shippings',
    'Processed',
    'Inventory',
    'Unfinished Parts',
    'Spare Parts',
    'Sales Volume',
    'Level',
    'Persons'
]

/**
 * Model provider service.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable() export default class DebugModelService {

    private model: ViewModel;
    private empty: ViewGroup;

    private edgeStyle: EdgeStyle;
    private flowStyle: EdgeStyle;
    private variableStyle: Style;
    private rateStyle: Style;
    private stockStyle: Style;
    private moduleStyle: GroupStyle;

    private baseUrl = "app.metaflow.io";

    getModel(): Promise<ViewModel> {
        this.model = this.model || new ViewModel("Debug Model", this.createDebugModel());
        return new Promise(promise => setTimeout(promise, 500)).then(() => { this.fetchGroup('/Population Model/Price/Economy Growth'); return this.model; })
    }

    fetchGroup(path: string): Observable<ViewGroup> {
        //return lazyFetch(`${this.baseUrl}/models/${this.model.name}?path=${path}`);
        return null;
    }

    resolveProxy(proxy: ViewProxy): Observable<ViewGroup> {
        return this.fetchGroup(proxy.name);
    }

    fetchFormalism(name: string) {
        return {
            name: "System Dynamics",
            alias: "sysdyn",
            path: "lang.metaflow.sysdyn",
            syntax: {
                viewpoint: {
                    name: "Stock and Flow Diagram",
                    type: "visual", // "textual", "hybrid"
                    path: "query", // path below namespace
                    styles: {
                        linkStyle: this.edgeStyle,
                        flowStyle: this.flowStyle,
                        rateStyle: this.rateStyle,
                        moduleStyle: this.moduleStyle,
                        variableStyle: this.variableStyle,
                        stockStyle: {
                            fill: 'salmon',
                            stroke: 'black',
                            shape : new Shape(Shapes.RECTANGLE),
                            labels: {
                                horizontal: Horizontal.RIGHT,
                                placement: Locality.OUTSIDE,
                                baseScale: 0.6,
                                lower: 0.05,
                                upper: 0.6,
                                color: 'salmon'
                            }
                        }
                    },
                    rules: [
                        { query: "StockMatch", style: "stockStyle", type: MapType.NODE },
                        { query: "ModuleMatch", style: "moduleStyle", type: MapType.NODE },
                        { query: "VariableMatch", style: "variableStyle", type: MapType.NODE },
                        { query: "RateQuery", style: "rateStyle", type: MapType.NODE },
                        { query: "ParentModule", style: "emptyStyle", type: MapType.HIERARCHY },
                        { query: "EdgeMatch", style: "edgeStyle", type: MapType.LINK }
                    ]
                },
                textual: {
                    name: "Module Language",
                    type: "hybrid",
                    visual: "Stock and Flow Diagram",

                }
            },
            abstract: {
                base: "lang://metaflow.io/base?version=1.0.0",
                version: "1.0.0",
                type: "emf",
                entities: {
                    stock: {

                    },
                }
            },
            transform: {

            }
        }
    }

    private createStock() {
        let item = new ViewItem(
            this.randomName(),
            this.random() * 20000,
            this.random() * 20000,
            192,
            108
        );
        item.style = this.stockStyle;
        return item;
    }

    private createVariable() {
        let variable = new ViewItem(
            this.randomName(),
            this.random() * 20000,
            this.random() * 20000,
            32,
            32
        );
        variable.style = this.variableStyle;
        return variable;
    }

    private createRate() {
        let variable = new ViewItem(
            this.randomName(),
            this.random() * 20000,
            this.random() * 20000,
            64,
            64
        );
        variable.style = this.rateStyle;
        return variable;
    }

    private createModule() {
        let module = new ViewGroup(
            this.randomName(),
            this.random() * 20000,
            this.random() * 20000,
            300,
            260,
            1
        );
        module.style = this.moduleStyle;
        return module;
    }

    private randomName() {
        let n = Math.floor(Math.random() * NAMES.length);
        return NAMES[n < 0 ? 0 : n];
    }

    private createDebugModel(): ViewGroup {
        let MAX = 3;
        let level = MAX;
        let o: ViewGroup = null;
        let root: ViewGroup = null;
        while (level--) {
            let group = new ViewGroup(`Level #${MAX - level}`, 2000, 2000, 2000, 2000, 0.1);
            group.style = this.moduleStyle;

            let entity = 180;
            while (entity) {
                let rnd = Math.random();
                let item;
                if (rnd < .25) {
                    item = this.createStock();
                } else if (rnd < .75) {
                    item = this.createVariable();
                } else if (rnd < .90) {
                    item = this.createRate();
                } else {
                    item = this.createModule();
                }

                group.addContent(item);

                let neighbor = this.findConnection(item, group.contents, 2000);
                if (neighbor) {
                    item.addLink(new ViewEdge(item, neighbor, this.edgeStyle));
                }

                entity--;
            }
            if (o) {
                o.addContent(group);
            } else {
                root = group;
            }
            o = group;
        }
        return root;
    }

    private random(): number {
        return Math.cbrt(Math.random() * Math.random() * Math.random());
    }

    private findConnection(item: ViewNode, siblings: ViewNode[], distance: number): ViewNode {
        let quad = distance * distance;
        for (let sibling of siblings) {
            let dX = item.centerX - sibling.centerX;
            let dY = item.centerY - sibling.centerY;
            if (dX * dX + dY * dY <= quad && sibling !== item) {
                return sibling;
            }
        }

        return null;
    }

    constructor() {
        
        /* STYLES */

        this.moduleStyle = new GroupStyle();
        this.moduleStyle.actsAsPortal = true;
        this.moduleStyle.shape = new Shape(Shapes.ROUNDED);
        this.moduleStyle.shape.a = 6;
        this.moduleStyle.fill = 'silver';
        this.moduleStyle.labels = new Label();
        this.moduleStyle.labels.baseScale = 0.7;
        this.moduleStyle.labels.alignment = TextAlignment.CENTER;
        this.moduleStyle.labels.limits(.2, 1.6);
        this.moduleStyle.labels.color = 'cornflowerblue';

        this.variableStyle = new Style();
        this.variableStyle.fill = 'mediumseagreen';
        this.variableStyle.stroke = 'black';
        this.variableStyle.shape = new Shape(Shapes.CIRCLE);
        this.variableStyle.labels = new Label();
        this.variableStyle.labels.horizontal = Horizontal.RIGHT;
        this.variableStyle.labels.placement = Locality.OUTSIDE;
        this.variableStyle.labels.baseScale = 0.6;
        this.variableStyle.labels.limits(.05, .6);
        this.variableStyle.labels.color = 'mediumseagreen';

        this.stockStyle = new Style();
        this.stockStyle.fill = 'salmon';
        this.stockStyle.shape = new Shape(Shapes.RECTANGLE);
        this.stockStyle.labels = new Label();
        this.stockStyle.labels.vertical = Vertical.TOP;
        this.stockStyle.labels.placement = Locality.OUTSIDE;
        this.stockStyle.labels.baseScale = 0.6;
        this.stockStyle.labels.limits(.1, 1);
        this.stockStyle.labels.color = 'salmon';

        this.rateStyle = new Style();
        this.rateStyle.fill = 'goldenrod';
        this.rateStyle.shape = new Shape(Shapes.HOURGLASS);
        this.rateStyle.labels = new Label();
        this.rateStyle.labels.vertical = Vertical.TOP;
        this.rateStyle.labels.placement = Locality.OUTSIDE;
        this.rateStyle.labels.baseScale = 0.6;
        this.rateStyle.labels.limits(.1, .8);
        this.rateStyle.labels.color = 'goldenrod';

        /* EDGES */

        this.edgeStyle = new EdgeStyle();
        this.edgeStyle.stroke = 'blue';

        this.flowStyle = new EdgeStyle();
        this.flowStyle.stroke = 'black';
        this.flowStyle.strokeWidth = 4;

        /* RENDERING */

        let render = new Mapper();
        render.cacheShape(this.moduleStyle);
        render.cacheShape(this.stockStyle);
        render.cacheShape(this.variableStyle);
        render.cacheShape(this.rateStyle);
    }
}

declare var fetch;

function lazyFetch(url, options?) {
    return new Observable(observer => {
        let cancelToken = false;
        fetch(url, options)
            .then(res => {
                if (!cancelToken) {
                    return res.json().then(data => {
                        observer.next(data);
                        observer.complete();
                    });
                }
            }).catch(err => observer.error(err));
        return () => {
            cancelToken = true;
        };
    });
}