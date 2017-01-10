import { Injectable } from "@angular/core";
import { ViewGroup, ViewItem, ViewEdge, ViewModel, ViewNode, ViewProxy } from "../common/viewmodel";
import { Language, ConcreteSyntax, Mapping, Rule, MapType } from "../common/language";
import { Style, GroupStyle, EdgeStyle, Label, TextAlignment } from '../common/styling';
import { Shape, Shapes } from '../common/shapes';
import { Vertical, Horizontal, Locality } from '../common/layout';
import { Observable } from "rxjs/Observable";

const DISTRIBUTION = 0;
const ENTITIES_PER_LEVEL = 500;
const MAX_LEVELS = 4;
const ROOT_SCALE = 0.1;
const ROOT_WIDTH = 2000;
const SPACE = ROOT_WIDTH / ROOT_SCALE;

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
    'Persons',
    'Clock Time',
    'Trains',
    'Summertime',
    'Bleach',
    'Market Price',
    'Retail Growth'
]

/**
 * Model provider service.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable() export class ModelService {

    private model: ViewModel;
    private empty: ViewGroup;

    private edgeStyle: EdgeStyle;
    private flowStyle: EdgeStyle;
    private variableStyle: Style;
    private rateStyle: Style;
    private stockStyle: Style;
    private moduleStyle: GroupStyle;

    /**
     * Retrieve all items within the current path
     * 
     * @endpoint /api/v1/projects/${id}/${path}
     */
    fetchLevel(project: string, path: string): Observable<ViewModel> {
        this.model = this.model || new ViewModel(project, this.createDebugModel());
        return Observable.create(obs => {
            setTimeout(() => {
                obs.next(this.model);
                obs.complete();
            })
        });
    }

    /**
     * Retrieve all availiable projects.
     * 
     * @endpoint /api/v1/user/$id/projects/
     */
    fetchProjects(user: string): Observable<Array<string>> {
        return Observable.of([
            "",
            "",
            "",
            ""
        ]);
    }

    /**
     * Retrieve all currenly availiable formalisms.
     * 
     * @endpoint /api/v1/projects/${id}/path
     */
    fetchFormalisms(project: string): Observable<Array<any>> {
        return Observable.of([{
            name: "System Dynamics",
            alias: "sysdyn",
            version: "1.0.0",
            syntax: {
                viewpoint: {
                    name: "Stock and Flow Diagram",
                    type: "visual", // "textual", "hybrid"
                    path: "query", // path below namespace
                    styles: [
                        this.rateStyle,
                        this.stockStyle,
                        this.variableStyle,
                        this.moduleStyle
                    ],
                    styleMap: {
                        linkStyle: this.edgeStyle,
                        flowStyle: this.flowStyle,
                        rateStyle: this.rateStyle,
                        moduleStyle: this.moduleStyle,
                        variableStyle: this.variableStyle,
                        stockStyle: {
                            fill: 'salmon',
                            stroke: 'black',
                            shape: new Shape(Shapes.RECTANGLE),
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
                    type: "hybrid"
                }
            },
            abstract: {
                name: "StockAndFlow",
                uri: "metaflow.io",
                prefix: "sysdyn",
                version: "1.0.0",
                type: "emf",
                generateNamespace: function () {
                    return `${this.type}://${this.uri}/${this.prefix}/${this.name}${this.version ? `?v=${this.version}` : ''}`;
                },
                dependencies: [
                    "emf://metaflow.io/math/Expression?v=0.8.1",
                    "emf://metaflow.io/unit/Units?v=0.6.2",
                    "emf://metaflow.io/base/Base?v=1.0.0"
                ],
                entities: [
                    {
                        name: "Variable",
                        attributes: [
                            {
                                name: "formula",
                                type: "string",
                                upperBound: -1,
                            }
                        ],
                        references: [
                            {
                                name: 'friends',
                                upperBound: -1,
                                containment: false,
                            }
                        ]
                    },
                    {
                        name: "Stock",
                        attributes: [
                            {
                                name: "initial",
                                info: "Formula describing the initial value of a stock",
                                type: "string",
                                upperBound: 1
                            }
                        ],
                        references: [
                            {
                                name: 'friends',
                                upperBound: -1,
                                containment: false,
                            }
                        ]
                    }
                ]
            },
            transform: {

            }
        }]);
    }

    private createStock() {
        let item = new ViewItem(
            this.randomName(),
            2000 * Math.floor(this.random() * 10) * (1 + this.random() / 8),
            2000 * Math.floor(this.random() * 10) * (1 + this.random() / 8),
            192,
            108
        );
        item.style = this.stockStyle;
        return item;
    }

    private createVariable() {
        let variable = new ViewItem(
            this.randomName(),
            this.random() * SPACE,
            this.random() * SPACE,
            32,
            32
        );
        variable.style = this.variableStyle;
        return variable;
    }

    private createRate() {
        let variable = new ViewItem(
            this.randomName(),
            this.random() * SPACE,
            this.random() * SPACE,
            64,
            64
        );
        variable.style = this.rateStyle;
        return variable;
    }

    private createModule() {
        let module = new ViewGroup(
            this.randomName(),
            this.random() * SPACE,
            this.random() * SPACE,
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
        let o: ViewGroup = null;
        let root: ViewGroup = null;
        let level = MAX_LEVELS;
        while (level--) {
            let group = new ViewGroup(`Level #${MAX_LEVELS - level}`, 2000, 2000, 2000, 2000, 0.1);
            group.style = this.moduleStyle;

            let entity = ENTITIES_PER_LEVEL;
            while (entity) {
                let rnd = Math.random();
                let item;
                let flow = false;
                if (rnd < .25) {
                    item = this.createStock();
                    flow = true;
                } else if (rnd < .75) {
                    item = this.createVariable();
                } else if (rnd < .90) {
                    item = this.createRate();
                    flow = true;
                } else {
                    item = this.createModule();
                }

                group.addContent(item);

                let neighbor = this.findConnection(item, group.contents, 2000);
                if (neighbor) {
                    item.addLink(new ViewEdge(item, neighbor, flow ? this.flowStyle : this.edgeStyle));
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
        if (DISTRIBUTION == 0) return Math.random();
        else if (DISTRIBUTION == 1) return Math.sqrt(Math.random() * Math.random());
        else return Math.cbrt(Math.random() * Math.random() * Math.random());
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
        this.stockStyle.strokeWidth = 3;
        this.stockStyle.labels = new Label();
        this.stockStyle.labels.vertical = Vertical.TOP;
        this.stockStyle.labels.placement = Locality.OUTSIDE;
        this.stockStyle.labels.baseScale = 0.6;
        this.stockStyle.labels.limits(.1, 1);
        this.stockStyle.labels.color = 'salmon';

        this.rateStyle = new Style();
        this.rateStyle.fill = 'goldenrod';
        this.rateStyle.shape = new Shape(Shapes.HOURGLASS);
        this.rateStyle.stroke = "blue";
        this.rateStyle.strokeWidth = 2;
        this.rateStyle.labels = new Label();
        this.rateStyle.labels.vertical = Vertical.TOP;
        this.rateStyle.labels.placement = Locality.OUTSIDE;
        this.rateStyle.labels.baseScale = 0.6;
        this.rateStyle.labels.limits(.1, .8);
        this.rateStyle.labels.color = 'goldenrod';

        /* EDGES */

        this.edgeStyle = new EdgeStyle();
        this.edgeStyle.stroke = 'blue';
        this.edgeStyle.strokeWidth = 4;

        this.flowStyle = new EdgeStyle();
        this.flowStyle.stroke = 'yellow';
        this.flowStyle.strokeWidth = 8;
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