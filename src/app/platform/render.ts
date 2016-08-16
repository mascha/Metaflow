import {Style, Label} from '../common/styling';
import {Shape, ShapeType} from '../common/shapes';
import {ViewVertex, ViewGroup, ViewItem} from '../common/viewmodel';

/**
 * Class responsible for rendering style shapes
 * as cacheable bitmaps or pixi graphics.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export default class ShapeRenderer {

  private images = Object.create(null);
  private urls = Object.create(null);

  private getColor(color: any): number {
    if (!color) return null;
    if (!color.length) return color;
    return Colors[color] || 0x000000;
  }

  renderLabel(item: ViewVertex): any {
    let style = item.style;
    if (!style) return; // no style
    let labels: any = style.labels;
    if (!labels) return; // no label

    /* check for multiple labels */
    if (labels.length) {

    } else { // single label
        let label = labels as Label;
        let text = item.name;
        let pixi = null;
        
        if (!label.cache) {
          pixi =  {
            fill: label.color || 0x3d3834,
            stroke: label.backdrop || 'white',
            strokeThickness: 8,
            lineJoin: 'round'
          };

          label.cache = pixi;
        }

        let mapped = new PIXI.Text(text, pixi, 0.6);
        item.labels = mapped;
    }
  }

  renderShape(style: Style, ctx: PIXI.Graphics, item: ViewVertex) {
    let fill = this.getColor(style.fill);
    let stroke = this.getColor(style.stroke);

    if (fill) ctx.beginFill(fill);
    
    switch (style.shape.type) {
      case ShapeType.SQUARE, ShapeType.RECTANGLE:
          ctx.drawRect(item.left, item.top, item.width, item.height);
        break;

      case ShapeType.CIRCLE:
          ctx.drawCircle(item.left, item.top, item.width);
        break;

      case ShapeType.DIAMOND: 
          ctx.moveTo(item.left + item.width / 2, item.top);
          ctx.lineTo(item.left + item.width, item.top + item.height / 2);
          ctx.lineTo(item.left + item.width / 2, item.top + item.height);
          ctx.lineTo(item.left, item.top + item.height / 2);
        break;

      case ShapeType.TRIANGLE:
          ctx.moveTo(item.left + item.width / 2, item.top);
          ctx.lineTo(item.left, item.top + item.height);
          ctx.lineTo(item.left + item.width, item.top + item.height);
        break;

      case ShapeType.ROUNDED:
          ctx.drawRoundedRect(item.left, item.top, item.width, item.height, style.shape.a || 12);
        break;

      case ShapeType.HOURGLASS:
          ctx.moveTo(item.left, item.top);
          ctx.lineTo(item.left + item.width, item.top);
          ctx.lineTo(item.left, item.top + item.height);
          ctx.lineTo(item.left + item.width, item.top + item.height);
        break;

      default: console.warn('Tried to render unknown shape class (' + style.shape.type + ')')
        break;
    }

    if (fill) ctx.endFill();
  }

  cacheShape(style: Style) {
    let canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;

    let ctx = canvas.getContext('2d');

    ctx.fillStyle = style.fill;

    switch (style.shape.type) {
      case ShapeType.SQUARE, ShapeType.RECTANGLE:
        ctx.fillRect(0, 0, 16, 16);
        break;

      case ShapeType.TRIANGLE:
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(8, 0);
        ctx.lineTo(16, 16);
        ctx.closePath();
        ctx.fill();
        break;

      case ShapeType.CIRCLE:
        ctx.beginPath();
        ctx.arc(8, 8, 8, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        break;

      case ShapeType.ROUNDED:
        let r = 2;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(16 - r, 0);
        ctx.quadraticCurveTo(16, 0, 16, r);
        ctx.lineTo(16, 16 - r);
        ctx.quadraticCurveTo(16, 16, 16 - r, 16);
        ctx.lineTo(r, 16);
        ctx.quadraticCurveTo(0, 16, 0, 16 - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fill();
        break;

      case ShapeType.HOURGLASS:
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(14, 0);
        ctx.lineTo(2, 16);
        ctx.lineTo(14, 16);
        ctx.closePath();
        ctx.fill();
        break;
      
      case ShapeType.DIAMOND: 
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(16, 8);
        ctx.lineTo(8, 16);
        ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fill();
        break;

      default: console.warn('Tried to render unknown shape class (' + style.shape.type + ')')
        break;
    }

    style.cachedImage = canvas;
    style.cachedURL = canvas.toDataURL();
  }

   renderItem(item: ViewItem): any {
        if (item.visual) {
            return;
        } else {
            let visual = new PIXI.Graphics();
            let style = item.style;
            this.renderShape(style, visual, item)
            item.visual = visual;
        }
    }

    renderGroup(group: ViewGroup, topLevel: boolean, oblique: boolean): any {
        if (group.visual) {
            return;
        }
        
        let root = new PIXI.Container();
        root.width = group.width;
        root.height = group.height;

        if (!topLevel) {
            root.position.set(group.left, group.top);
        }

        let shape = new PIXI.Graphics();

        if (oblique) {
            shape.beginFill(0xeeeeee);
            shape.drawRoundedRect(0, 0, group.width, group.height, 12);
            shape.endFill();
        } else {
            shape.lineStyle(16, 0xeeeeee);
            shape.drawRoundedRect(0, 0, group.width, group.height, 12);
        }

        let content = new PIXI.Container();
        let inner = group.scale;
        content.scale.set(inner, inner);

        root.addChild(shape);
        root.addChild(content);

        if (!topLevel && !oblique) {
            // root.cacheAsBitmap = true;
        }

        group.visual = root;
    }

    attach(node: ViewVertex, group: ViewGroup) {
        let child = node.visual;
        if (!child) {
            throw new Error('Node has no rendered visual');
        }

        let root = group.visual as PIXI.Container;
        if (!root) {
            throw new Error('Could not find renderer visual of the given group');
        }

        /* TODO fix this direct index access */
        let content = root.children[1] as PIXI.Container;
        if (!content) {
            throw new Error('Could not find low level content container');
        }

        content.addChild(child);
    }
}

/**
 * Named color lookup dictionary
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
let Colors = {
    'cornflowerblue': 0x6495ED,
    'mediumseagreen': 0x3CB371,
    'goldenrod': 0xDAA520,
    'darkgrey': 0xA9A9A9,
    'darkgray': 0xA9A9A9,
    'lightgray': 0xD3D3D3,
    'lightgrey': 0xD3D3D3,
    'black': 0x000000,
    'white' : 0xffffff,
}