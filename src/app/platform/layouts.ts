import {LayoutAlgorithm} from '../common/layout';
import {ViewGroup} from '../common/viewmodel';

/**
 * Implements a cassovary constraint solver layout.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class ConstraintLayout implements LayoutAlgorithm {
    
    /* TODO: delegate to cassowary.js */
    apply(group: ViewGroup) {
        return null;
    }
}

/**
 * Implements a force based layout alogrithm.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class ForceBasedLayout implements LayoutAlgorithm {
    
    private mapToSpringy(group: ViewGroup): Springy.Graph {
        let result = new Springy.Graph();
        let c = group.contents;
        for(let i = 0, l = c.length; i<l; i++) {
            result.addNode(i.toString());
            if (Math.random() > 0.5) {
                let source = i.toString();
                let target = Math.floor(Math.random() * l).toString();
                result.addEdge(source, target);
                console.log('added edge from ' + i.toString() + ' to ' + target)
            }
        }
        return result;
    }

    apply(group: ViewGroup) {
        /* construct wrapper graph */
        let mapped = this.mapToSpringy(group);
        
        /* calculate positions */
        var layout = new Springy.Layout.ForceDirected(
            mapped, 400, 400, 0.5
        );

        /* iterate until solution is found */
        while (layout.totalEnergy() < 0.01) {
            layout.tick(0.03);
        }

        /* reapply positions */
        let c = group.contents;
        let m = mapped.nodePoints;
        let l = m.length;
        for(let i = 0; i < l; i++) {
            let source = c[i];
            let target = m[i];
            source.left = target.x;
            source.top = target.y;
        }
    }
}

/**
 * Implements a layered graph layout algorithm.
 * 
 * It is a layer-based layout algorithm that is particularly suited 
 * for node-link diagrams with an inherent direction and ports 
 * i.e. explicit attachment points on a node's border.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class LayeredLayout implements LayoutAlgorithm {

    apply(group: ViewGroup) {
        if (!group) return group;
        if (!group.contents) return group;
        let l = group.contents.length;    
        if (l > 0) {

        }
    }
}