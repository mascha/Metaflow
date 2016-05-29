import {ViewGroup, ViewItem} from "../common/viewmodel";
import {Injectable} from '@angular/core';

/**
 * Model provider service.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
@Injectable()
export default class ModelService {
    
    private model: ViewGroup;
    private empty: ViewGroup;

    getDefaultModel() {
        this.empty = this.empty || new ViewGroup('EMPTY', 2000, 2000, 2000, 2000, 1);
        return this.empty;
    }

    getModel(): ViewGroup {
        this.model = this.model || ModelService.createDebugModel();
        return this.model;
    }

    private static createDebugModel(): ViewGroup {
        let i = 40;
        let o : ViewGroup = null;
        let root: ViewGroup = null;
        while (i--) {
            let group = new ViewGroup(`Level ${40 - i}`, 2000, 2000, 2000, 2000, 0.1);
            let j = 120;
            while (j) {
                let x = Math.random() * 18000;
                let y = Math.random() * 18000;
                let item = new ViewItem(`Item (${j}/${i})`, x, y, 192, 108);
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
}
