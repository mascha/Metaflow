import {Injectable} from "@angular/core";
import {ViewGroup, ViewItem, Model, ViewVertex} from "../common/viewmodel";
import {Style, GroupStyle, Label} from '../common/styling';
import {Shape, ShapeType} from '../common/shapes';
import {Vertical, Horizontal, Locality} from '../common/layout';
import {Mapper} from '../platform/render';

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
@Injectable() export default class ModelService {
    
    private model: Model;
    private empty: ViewGroup;

    private variableStyle: Style;
    private rateStyle: Style;
    private stockStyle: Style;
    private moduleStyle: GroupStyle;

    getModel(): Promise<Model> {
        this.model = this.model || new Model("Debug Model", this.createDebugModel());
        return new Promise(promise => setTimeout(promise, 500)).then(() => this.model)
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
        let o : ViewGroup = null;
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

                let neighbor = this.findConnection(item, group.contents, 4000);
                //console.log((item ? item.name : "NULL") + ' -> ' + (neighbor ? neighbor.name: "NULL"));

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
        return Math.sqrt(Math.random() * Math.random());
    }

    private findConnection(item: ViewVertex, siblings: ViewVertex[], distance: number): ViewVertex {
        for (let sibling of siblings) {
            let dX = item.centerX - sibling.centerX;
            let dY = item.centerY - sibling.centerY;
            if (Math.sqrt(dX*dX + dX*dY) <= distance && sibling !== item) {
                return sibling;   
            }
        }

        return null;
    }

    constructor() {
        this.moduleStyle = new GroupStyle();
        this.moduleStyle.actsAsPortal = true;
        this.moduleStyle.shape = new Shape(ShapeType.ROUNDED);
        this.moduleStyle.shape.a = 6;
        this.moduleStyle.fill = 'darkgrey';
        this.moduleStyle.labels = new Label();
        this.moduleStyle.labels.setScaling(.2, .7, 1.6);
        this.moduleStyle.labels.color = 'cornflowerblue';
        
        this.variableStyle = new Style();
        this.variableStyle.fill = 'mediumseagreen';
        this.variableStyle.shape = new Shape(ShapeType.CIRCLE);
        this.variableStyle.labels = new Label();
        this.variableStyle.labels.horizontal = Horizontal.RIGHT;
        this.variableStyle.labels.placement = Locality.OUTSIDE;
        this.variableStyle.labels.setScaling(.05, .5, .6);
        this.variableStyle.labels.color = 'mediumseagreen';

        this.stockStyle = new Style();
        this.stockStyle.fill = 'salmon';
        this.stockStyle.shape = new Shape(ShapeType.RECTANGLE);
        this.stockStyle.labels = new Label();
        this.stockStyle.labels.vertical = Vertical.TOP;
        this.stockStyle.labels.placement = Locality.OUTSIDE;
        this.stockStyle.labels.setScaling(.1, .6, 1);
        this.stockStyle.labels.color = 'salmon';

        this.rateStyle = new Style();
        this.rateStyle.fill = 'goldenrod';
        this.rateStyle.shape = new Shape(ShapeType.HOURGLASS);
        this.rateStyle.labels = new Label();
        this.rateStyle.labels.vertical = Vertical.TOP;
        this.rateStyle.labels.placement = Locality.OUTSIDE;
        this.rateStyle.labels.setScaling(.1, .6, .8);
        this.rateStyle.labels.color = 'goldenrod';

        let render = new Mapper();
        render.cacheShape(this.moduleStyle);
        render.cacheShape(this.stockStyle);
        render.cacheShape(this.variableStyle);
        render.cacheShape(this.rateStyle);
    }
}
