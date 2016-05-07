import {ViewGroup, ViewItem} from "../common/viewmodel";
import {Injectable} from '@angular/core';
/**
 * Model provider service.
 */
@Injectable()
export default class ModelService {
    
    private model: ViewGroup;

    getModel(): ViewGroup {
        return this.model;
    }

    private createDebugModel(): ViewGroup {
        /*
         let root = new ViewGroup('ROOT', 0, 0, 1000, 1000, .1);
         let first = new ViewGroup('FIRST', 5000, 5000, 5000, 5000, .1);
         let item = new ViewItem('ITEM1', 25000, 25000, 2500, 2500);
         */

        let i = 40;
        let o : ViewGroup = null;
        let root: ViewGroup = null;
        while (i--) {
            let group = new ViewGroup(`Level ${40 - i}`, 2000, 2000, 2000, 2000, 0.1);
            let j = 120;
            while (j) {
                let x = Math.random() * 18000;
                let y = Math.random() * 18000;
                let item = new ViewItem('Item', x, y, 192, 108);
                group.addContent(item);
                j--;
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

    constructor() {
        this.model = this.createDebugModel();
    }
}
