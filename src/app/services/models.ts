import {ViewGroup, ViewItem} from "../common/viewmodel";
import {Injectable} from "@angular/core";

const seed = function(s) {
    let m_w  = s;
    let m_z  = 987654321;
    let mask = 0xffffffff;

    return function() {
        m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
        m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;

        var result = ((m_z << 16) + m_w) & mask;
        result /= 4294967296;

        return result + 0.5;
    }
};

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

    private random = seed(123456);

    getDefaultModel() {
        this.empty = this.empty || new ViewGroup('EMPTY', 2000, 2000, 2000, 2000, 1);
        return this.empty;
    }

    getModel(): ViewGroup {
        this.model = this.model || this.createDebugModel();
        return this.model;
    }

    private createStock() {
        return new ViewItem(
            this.randomName(),
            this.random() * 18000,
            this.random() * 18000,
            192,
            108
        );
    }

    private createVariable() {
        return new ViewItem(
            this.randomName(),
            this.random() * 18000,
            this.random() * 18000,
            64,
            64
        );
    }

    private createModule() {
        return new ViewGroup(
            this.randomName(),
            this.random() * 18000,
            this.random() * 18000,
            300,
            260,
            1
        );
    }

    private randomName() {
        return '#' + (this.random().toString(36) + '00000000000000000').slice(2, 8+2);
    }

    private createDebugModel(): ViewGroup {
        let i = 40;
        let o : ViewGroup = null;
        let root: ViewGroup = null;
        while (i--) {
            let group = new ViewGroup(`Level #${40 - i}`, 2000, 2000, 2000, 2000, 0.1);
            let j = 120;
            while (j) {
                let rnd = this.random();
                let item;
                if (rnd < .3333) {
                    item = this.createStock();
                } else if (rnd < .6666) {
                    item = this.createVariable();
                } else {
                    item = this.createModule();
                }
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
