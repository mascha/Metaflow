import { Style, Label, TextTransform } from '../common/styling';
import { Shape, ShapeType } from '../common/shapes';
import { Locality, Horizontal, Vertical } from '../common/layout';
import { ViewVertex, ViewGroup, ViewItem } from '../common/viewmodel';

/**
 * Class responsible for rendering style shapes
 * as cacheable bitmaps or pixi graphics.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Mapper {

  private images = Object.create(null);
  private urls = Object.create(null);

  private getColor(color: any): number {
    if (!color) return null;
    if (!color.length) return color;
    return Colors[color] || 0x000000;
  }

  private renderText(item: ViewVertex, label: Label): string {
    let text = item.name;
    let regex = /\b\w/g;
    switch (label.transform) {
      case TextTransform.LOWERCASE: text = text.toLowerCase(); break;
      case TextTransform.UPPERCASE: text = text.toUpperCase(); break;
      case TextTransform.CAPITALIZE: text = text.toLowerCase().replace(regex, l => l.toUpperCase()); break;
    }
    return text;
  }

  private renderLabel(label: Label, item: ViewVertex, scale: number): XText {
      let text = this.renderText(item, label);

      label.cache = label.cache || {
        fill: label.color || 0x3d3834,
        // stroke: label.haloColor || 'white',
        // strokeThickness: 4,
        // lineJoin: 'round'
      };

      let mapped = new XText(text, label.cache, 0.1);
      mapped.baseScale = label.baseScale;
      mapped.lowerScale = label.lowerScale;
      mapped.upperScale = label.upperScale;
      item.labels = mapped;

      let x = item.left + 0.5 * (1 + label.horizontal) * item.width,
        y = item.top + 0.5 * (1 + label.vertical) * item.height,
        pX = 0.5 * (1 - label.horizontal * label.placement),
        pY = 0.5 * (1 - label.vertical * label.placement);

      mapped.scale.set(label.baseScale, label.baseScale);
      mapped.position.set(x * scale, y * scale);
      mapped.anchor.set(pX, pY);
      
      return mapped;
  }

  public renderLabels(item: ViewVertex): any {
    let style = item.style;
    if (!style) return; // no style
    let labels: any = style.labels;
    if (!labels) return; // no label

    let scale = item.parent ? item.parent.scale : 1;

    if (labels.length) {
      labels = labels as Label[];

    } else {
      let label = labels as Label;
      item.labels = this.renderLabel(label, item, scale);
    }
  }

  public renderShape(style: Style, ctx: PIXI.Graphics, item: ViewVertex) {
    let fill = this.getColor(style.fill);
    let stroke = this.getColor(style.stroke);

    if (fill) ctx.beginFill(fill);
    if (stroke) ctx.lineColor = stroke;

    const l = item.left, t = item.top,
      w = item.width, h = item.height;

    switch (style.shape.type) {
      case ShapeType.SQUARE, 
           ShapeType.RECTANGLE:
        ctx.drawRect(l, t, w, h);
        break;

      case ShapeType.CIRCLE:
        let radius = w / 2;
        ctx.drawCircle(l + radius, t + radius, w / 2);
        break;

      case ShapeType.DIAMOND:
        ctx.moveTo(l + w / 2, t);
        ctx.lineTo(l + w, t + h / 2);
        ctx.lineTo(l + w / 2, t + h);
        ctx.lineTo(l, t + h / 2);
        break;

      case ShapeType.TRIANGLE:
        ctx.moveTo(l + w / 2, t);
        ctx.lineTo(l, t + h);
        ctx.lineTo(l + w, t + h);
        break;

      case ShapeType.ROUNDED:
        let a = style.shape.a || 12;
        ctx.drawRoundedRect(l, t, w, h, a);
        break;

      case ShapeType.HOURGLASS:
        let f = 0.5;
        ctx.moveTo(l, t);
        ctx.lineTo(l + w, t);
        ctx.lineTo(l + w / (1.8), t + h / 2);
        ctx.lineTo(l + w / (2.2), t + h / 2);
        ctx.endFill().beginFill(fill);
        ctx.moveTo(l, t + h);
        ctx.lineTo(l + w / (2.2), t + h / 2);
        ctx.lineTo(l + w / (1.8), t + h / 2);
        ctx.lineTo(l + w, t + h);
        break;

      default: console.warn('Tried to render unknown shape class (' + style.shape.type + ')')
        break;
    }

    if (fill) ctx.endFill();
  }

  public cacheShape(style: Style) {
    if (style.cachedImage) return;
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
        ctx.lineTo(9, 8);
        ctx.lineTo(14, 16);
        ctx.lineTo(2, 16);
        ctx.lineTo(7, 8);
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

  public renderItem(item: ViewItem, visual: any): any {
    if (item.visual) {
      return;
    } else {
      // let visual = new PIXI.Graphics();
      let style = item.style;
      this.renderShape(style, visual, item)
      item.visual = visual;
    }
  }

  public renderGroup(group: ViewGroup, topLevel: boolean, oblique: boolean): any {
    if (group.visual) return;

    let root = new XContainer();
    root.width = group.width;
    root.height = group.height;

    if (!topLevel) {
      root.position.set(group.left, group.top);
    }

    let shape = new PIXI.Graphics();
    root.shape = shape;

    if (oblique) {
      shape.beginFill(0xeeeeee);
      shape.drawRoundedRect(0, 0, group.width, group.height, 12);
      shape.endFill();
    } else if (!topLevel) {
      shape.lineStyle(16, 0xeeeeee);
      shape.drawRoundedRect(0, 0, group.width, group.height, 12);
    }

    let inner = group.scale;
    root.content = new PIXI.Container();
    root.content.scale.set(inner, inner);

    root.addChild(root.shape);
    root.addChild(root.content);

    if (!topLevel && !oblique) {
      root.cacheAsBitmap = true;
    }

    group.visual = root;
  }

  attach(node: ViewVertex, group: ViewGroup) {
    let child = node.visual;
    if (!child) {
      throw new Error('Node has no rendered visual');
    }

    let root = group.visual as XContainer;
    if (!root) {
      throw new Error('Could not find renderer visual of the given group');
    }

    /* TODO fix this direct index access */
    let content = root.content;
    if (!content) {
      throw new Error('Could not find low level content container');
    }

    content.addChild(child);
  }
}

export class NodeRenderer {

}

export class EdgeRenderer {

}

export class LabelRenderer {

}

export class ShapeRenderer {

}


/**
 * Named color lookup dictionary
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
const Colors = {
  'cornflowerblue': 0x6495ED,
  'mediumseagreen': 0x3CB371,
  'salmon': 0xFFA07A,
  'red': 0xFF0000,
  'goldenrod': 0xDAA520,
  'darkgrey': 0xA9A9A9,
  'darkgray': 0xA9A9A9,
  'lightgray': 0xD3D3D3,
  'lightgrey': 0xD3D3D3,
  'black': 0x000000,
  'white': 0xffffff
}

/**
 * Helper class for maintaining backlinks to the
 * originating label definition.
 */
export class XText extends PIXI.Text {
    lowerScale: number;
    baseScale: number;
    upperScale: number;
    origin: Label;
}

/**
 * Helper class for maintaining backlinks to the
 * originating group node.
 */
export class XContainer extends PIXI.Container {
    origin: ViewGroup;
    shape: PIXI.Graphics;
    content: PIXI.Container; 
}