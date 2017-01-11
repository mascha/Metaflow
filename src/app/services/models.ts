import { Injectable } from "@angular/core";
import { ViewGroup, ViewItem, ViewEdge, ViewModel, ViewNode } from "../common/viewmodel";
import { MapType } from "../common/language";
import { Style, GroupStyle, EdgeStyle, Label, TextAlignment, TextTransform } from '../common/styling';
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

    private SystemDynamics: any;
    private ECore: any;

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
     * Retrieve all issues present in the current project.
     * 
     * @endpoint /api/v1/project/$id/issues/
     */
    fetchIssues(project: string): Observable<Array<String>> {
        return Observable.of(NAMES);
    }

    /**
     * Retrieve all currenly availiable formalisms.
     * 
     * @endpoint /api/v1/projects/${id}/path
     */
    fetchFormalisms(project: string): Observable<Array<any>> {
        return Observable.of([
            this.SystemDynamics,
            this.ECore
        ]);
    }

    private createStock() {
        let item = new ViewItem(
            this.randomName(),
            2000 * Math.floor(this.random() * 10) * (1 + this.random() / 8) | 0,
            2000 * Math.floor(this.random() * 10) * (1 + this.random() / 8) | 0,
            192,
            108
        );
        item.style = this.stockStyle;
        return item;
    }

    private createVariable() {
        let variable = new ViewItem(
            this.randomName(),
            this.random() * SPACE | 0,
            this.random() * SPACE | 0,
            32,
            32
        );
        variable.style = this.variableStyle;
        return variable;
    }

    private createRate() {
        let variable = new ViewItem(
            this.randomName(),
            this.random() * SPACE | 0,
            this.random() * SPACE | 0,
            64,
            64
        );
        variable.style = this.rateStyle;
        return variable;
    }

    private createModule() {
        let module = new ViewGroup(
            this.randomName(),
            this.random() * SPACE | 0,
            this.random() * SPACE | 0,
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
        this.moduleStyle.labels = [new Label()];
        this.moduleStyle.labels[0].baseScale = 0.7;
        this.moduleStyle.labels[0].alignment = TextAlignment.CENTER;
        this.moduleStyle.labels[0].limits(.2, 1.6);
        this.moduleStyle.labels[0].color = 'cornflowerblue';

        this.variableStyle = new Style();
        this.variableStyle.fill = 'mediumseagreen';
        this.variableStyle.stroke = 'black';
        this.variableStyle.shape = new Shape(Shapes.CIRCLE);
        this.variableStyle.labels = [new Label(), new Label()];
        this.variableStyle.labels[0].horizontal = Horizontal.RIGHT;
        this.variableStyle.labels[0].placement = Locality.OUTSIDE;
        this.variableStyle.labels[0].baseScale = 0.6;
        this.variableStyle.labels[0].limits(.05, .6);
        this.variableStyle.labels[0].color = 'mediumseagreen';
        this.variableStyle.labels[1].horizontal = Horizontal.LEFT;
        this.variableStyle.labels[1].vertical = Vertical.MIDDLE;
        this.variableStyle.labels[1].placement = Locality.OUTSIDE;
        this.variableStyle.labels[1].baseScale = 0.3;
        this.variableStyle.labels[1].labelling = (i) => { return `${i.centerX} / ${i.centerY}` }
        this.variableStyle.labels[1].limits(.05, .6);
        this.variableStyle.labels[1].color = 'grey';

        this.stockStyle = new Style();
        this.stockStyle.fill = 'salmon';
        this.stockStyle.shape = new Shape(Shapes.RECTANGLE);
        this.stockStyle.strokeWidth = 3;
        this.stockStyle.labels = [new Label(), new Label()];
        this.stockStyle.labels[0].vertical = Vertical.TOP;
        this.stockStyle.labels[0].placement = Locality.OUTSIDE;
        this.stockStyle.labels[0].baseScale = 0.6;
        this.stockStyle.labels[0].limits(.1, 1);
        this.stockStyle.labels[0].color = 'salmon';
        this.stockStyle.labels[1].vertical = Vertical.MIDDLE;
        this.stockStyle.labels[1].placement = Locality.INSIDE;
        this.stockStyle.labels[1].labelling = (i) => { return (Math.random() * 100).toFixed(0) + "%" };
        this.stockStyle.labels[1].baseScale = 0.45;
        this.stockStyle.labels[1].limits(.1, .8);
        this.stockStyle.labels[1].color = 'white';


        this.rateStyle = new Style();
        this.rateStyle.fill = 'goldenrod';
        this.rateStyle.shape = new Shape(Shapes.HOURGLASS);
        this.rateStyle.stroke = "blue";
        this.rateStyle.strokeWidth = 2;
        this.rateStyle.labels = [new Label()];
        this.rateStyle.labels[0].vertical = Vertical.TOP;
        this.rateStyle.labels[0].placement = Locality.OUTSIDE;
        this.rateStyle.labels[0].baseScale = 0.6;
        this.rateStyle.labels[0].limits(.1, .8);
        this.rateStyle.labels[0].color = 'goldenrod';


        /* EDGES */

        this.edgeStyle = new EdgeStyle();
        this.edgeStyle.stroke = 'blue';
        this.edgeStyle.strokeWidth = 4;

        this.flowStyle = new EdgeStyle();
        this.flowStyle.stroke = 'yellow';
        this.flowStyle.strokeWidth = 8;

        this.SystemDynamics = {
            name: "System Dynamics",
            alias: "sysdyn",
            version: "1.0.0",
            syntax: [
                {
                    name: "Stock and Flow Diagram",
                    type: "visual",
                    styles: [
                        this.rateStyle,
                        this.stockStyle,
                        this.variableStyle,
                        this.moduleStyle
                    ],
                    mapping: {
                        namespace: "io.metaflow.query.sysdyn.query",
                        queryLanguage: "ViatraQuery",
                        ruleSet: [
                            { query: "StockMatch", style: "stockStyle", type: MapType.NODE },
                            { query: "ModuleMatch", style: "moduleStyle", type: MapType.NODE },
                            { query: "VariableMatch", style: "variableStyle", type: MapType.NODE },
                            { query: "RateQuery", style: "rateStyle", type: MapType.NODE },
                            { query: "ParentModule", style: "emptyStyle", type: MapType.HIERARCHY },
                            { query: "EdgeMatch", style: "edgeStyle", type: MapType.LINK }
                        ]
                    }
                },
                {
                    name: "SystemScript",
                    type: "textual",
                    styles: []
                }
            ],
            abstract: {
                name: "StockAndFlow",
                domain: "www.metaflow.io/lang",
                alias: "sysdyn",
                version: "1.0.0",
                type: "emf",
                dependencies: [
                    "www.metaflow.io/lang?name=Arithmetics&prefix=math&v=0.8.1&type=emf",
                    "www.metaflow.io/lang?name=Units&prefix=units&v=0.6.2&type=emf",
                ],
                entities: [
                    {
                        name: "Variable",
                        parent: "ecore|EClass",
                        attributes: [
                            {
                                name: "formula",
                                type: "math|Expression",
                                range: "*"
                            }
                        ],
                        references: [
                            {
                                name: 'friends',
                                type: 'ecore|EClass',
                                range: "0..*"
                            }
                        ]
                    },
                    {
                        name: "Stock",
                        parent: "ecore|EClass",
                        attributes: [],
                        references: [
                            {
                                name: 'initial',
                                type: 'math|Expression',
                                range: "1"
                            }
                        ]
                    }
                ]
            },
            transform: {

            }
        };

        this.ECore = {
            name: "EMF Modelling Language",
            alias: "ecore",
            version: "2.11.0",
            syntax: [
                {
                    name: "Visual EMF",
                    type: "visual",
                    styles: [
                        /*
                        {
                            name: "classStyle",
                            fill: "lightgrey",
                            stroke: "black",
                            shape: Shape.ROUNDED,
                            strokeWidth: 2
                        },
                        {
                            name: "packageStyle",
                            stroke: "lightgrey",
                            strokeWidth: 4,
                            shape: Shape.ROUNDED,
                            labels: [{
                                lowerScale: .1,
                                upperScale: .6,
                                baseScale: .5,
                                priority: 1,
                                defaultText: "CLASS",
                                color: 1,
                                haloColor: 0,
                                bold: false,
                                placement: Locality.OUTSIDE,
                                vertical: Vertical.TOP,
                                horizontal: Horizontal.CENTER,
                                transform: TextTransform.NONE,
                                alignment: TextAlignment.CENTER,
                            }]
                        },
                        {
                            name: "attributeStyle",
                        },
                        {
                            name: "referenceStyle",
                        },
                        */
                    ],
                    mapping: {
                        namespace: "io.metaflow.query.ecore.query",
                        queryLanguage: "ViatraQuery",
                        ruleSet: [
                            { query: "ClassMatch", style: "classStyle", type: MapType.NODE },
                            { query: "PackageMatch", style: "packageStyle", type: MapType.GROUP },
                            { query: "ReferenceMatch", style: "referenceStyle", type: MapType.LINK },
                            { query: "AttributeMatch", style: "attributeStyle", type: MapType.DECORATION },
                            { query: "ContainmentMatch", style: null, type: MapType.HIERARCHY },
                        ]
                    }
                },
                {
                    name: "XCore",
                    type: "textual",
                    styles: []
                }
            ],
            abstract: {
                name: "Ecore",
                domain: "http://www.eclipse.org/emf/2002/Ecore",
                alias: "ecore",
                version: "1.0.0",
                type: "emf",
                dependencies: [
                    "http://www.eclipse.org/emf/2002/Ecore?name=Ecore&prefix=ecore&v=0.8.1&type=emf",
                ],
                entities: [
                    {
                        name: "EObject"
                    },
                    {
                        name: "EClassifier",
                        parent: "ecore|EObject"
                    },
                    {
                        name: "ENameable",
                        parent: "ecore|EObject",
                        attributes: {
                            name: "name",
                            type: "string"
                        }
                    },
                    {
                        name: "ETypeable",
                        parent: "ecore|EObject",
                        attributes: {
                            name: "type",
                            type: "ecore|EObject"
                        }
                    },
                    {
                        name: "EClass",
                        parent: "ecore|ENameable",
                        attributes: [
                            {
                                name: "name",
                                type: "string"
                            }
                        ],
                        references: [
                            {
                                name: "eAttributes",
                                type: "ecore|EAttribute",
                                range: "0..*"
                            },
                            {
                                name: "eReferences",
                                type: "ecore|EReference",
                                range: "0..*"
                            }
                        ]
                    },
                    {
                        name: "EStructuralFeature",
                        parent: "ecore|ENameable",
                    },
                    {
                        name: "EAttribute",
                        parent: "ecore|EStructuralFeature",
                        attributes: [
                            {
                                name: "type",
                                type: "ecore|EClass"
                            }
                        ],
                    },
                    {
                        name: "EReference",
                        parent: "ecore|EStructuralFeature",
                        attributes: [
                            {
                                name: "containment",
                                type: "boolean"
                            },
                            {
                                name: "range",
                                type: "string"
                            }
                        ],
                        references: [
                            {
                                name: "eReferenceType",
                                type: "ecore|EClass",
                                range: "1"
                            }
                        ]
                    }
                ]
            },
            transform: {
                /* TBD */
            }
        };
    }
}