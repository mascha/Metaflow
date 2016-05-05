/*
 * Created by Martin Schade on 24.04.2016.
 */

import {IViewModelRenderer, IVisualRenderer} from '../../common/renderer'
import {ViewItem, ViewGroup, COLORS} from "../../common/viewmodel";
import {Camera} from "../../common/camera";

/**
 * Implements a scale-pan surface for konva.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class KonvaCamera extends Camera {
    
    protected translateWorldTo(tX:number, tY:number) {
        this.stage.x(tX);
        this.stage.y(tY);
    }

    protected scaleWorldTo(zoom:number) {
        this.stage.scaleX(zoom);
        this.stage.scaleY(zoom);
    }

    constructor(private stage: Konva.Stage) {
        super();
    }
}

/**
 * Konva viewmodel renderer.
 *
 * @author Martin Schade
 * @since 1.0.0
 */
export class KonvaRenderer implements 
    IVisualRenderer<Konva.Node, Konva.Group>, 
    IViewModelRenderer<Konva.Node, Konva.Group> 
{
    renderTree(group:ViewGroup):Konva.Group {
        throw new Error('Not implemented');
    }

    rotate(obj:Konva.Node, angle: number) {
        throw new Error('Not implemented');
    }

    fill(obj: Konva.Shape, fill: string) {
        if (fill) obj.fill(fill);
    }

    stroke(obj: Konva.Shape, stroke: string, width: number) {
        if (stroke) obj.stroke(stroke);
        if (width) obj.strokeWidth(width);
    }

    scale(obj:Konva.Node, scale: number) {
        obj.scaleX(scale);
        obj.scaleY(scale);
    }
    
    translate(obj:Konva.Node, x:number, y:number) {
        obj.x(x);
        obj.y(y);
    }

    circle(x:number, y:number, r:number): Konva.Circle {
        return new Konva.Circle({
            x: x, y: y, radius: r
        });
    }
    
    text(text:string): Konva.Text {
        return new Konva.Text({text: text});
    }

    rectangle(x:number, y:number, width:number, height:number): Konva.Rect {
        return new Konva.Rect({
            x: x, y: y, width: width, height: height
        });
    }

    rounded(x:number, y:number, width:number, height:number, radius: number): Konva.Rect {
        return new Konva.Rect({
            x: x, y: y, width: width, height: height, cornerRadius: radius
        });
    }

    group(): Konva.Group {
        return new Konva.Group()
    }

    attach(node: ViewItem, group: ViewGroup) {
        let vGroup = group.visual as Konva.Group;
        let vContent = vGroup.getChildren(null);
        let vScale = vContent[1] as Konva.Group;
        vScale.add(node.visual);
    }

    renderItem(i:ViewItem): Konva.Node {
        let _r = this.rectangle(i.left, i.top, i.width, i.height);
        let _l = this.text(i.label);

        this.stroke(_r, 'royalblue', 2);
        this.fill(_r, 'cornflowerblue');
        i.visual = _r;
        return _r;
    }

    renderGroup(g:ViewGroup, topLevel: boolean): Konva.Group {
        let _g = this.group();
        
        if (!topLevel)
            this.translate(_g, g.left, g.top);

        let _s = this.rounded(0, 0, g.width, g.height, 12);

        this.stroke(_s, 'darkgray', 32);

        let _l = this.text(g.label);
        let _c = this.group();
        this.scale(_c, g.scale);

        _g.add(_s);
        _g.add(_c);
        _g.add(_l);
        g.visual = _g;
        return _g;
    }
}


