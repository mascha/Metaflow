import { Style, Label, TextTransform } from '../common/styling';
import { Shape, Shapes } from '../common/shapes';
import { Locality, Horizontal, Vertical } from '../common/layout';
import { ViewNode, ViewGroup, ViewItem } from '../common/viewmodel';

/**
 * Class responsible for rendering style shapes
 * as cacheable bitmaps or pixi graphics.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export class Mapper {

  private matchWords = new RegExp(/\b\w/g);

  /**
   * Retrieve the color number from a string or color array;
   * TODO move to color renderer 
   */
  private getColor(color: any): number {
    if (!color) return null;
    return Colors[color];
  }


  /**
   * Render the string which is to be displayed
   * by applying the labelling functon (if present)
   * and transforming the result again.
   */
  private renderText(item: ViewNode, label: Label): string {
    // item['labelling'] ? item['labelling'](item) : item.name;
    let text = item.name;
    switch (label.transform) {
      case TextTransform.LOWERCASE: text = text.toLowerCase(); break;
      case TextTransform.UPPERCASE: text = text.toUpperCase(); break;
      case TextTransform.CAPITALIZE: text = text.toLowerCase().replace(this.matchWords, l => l.toUpperCase()); break;
    }
    return text;
  }

  private createDefaultLabel(label: Label): PIXI.TextStyle {
    return label.cache || {
      fill: label.color || Colors.maroon,
      stroke: Colors.lightblack, // label.haloColor || Colors.black,
      strokeThickness: 5,
      lineJoin: 'round',
      align: label.alignment || 'left'
    };
  }

  /** 
   * Render a single label using the pixijs platform.
   */
  private renderLabel(label: Label, item: ViewNode, scale: number): XText {
    let text = this.renderText(item, label);

    label.cache = this.createDefaultLabel(label);

    let mapped = new XText(text, label);

    let x = item.left + 0.5 * (1 + label.horizontal) * item.width;
    let y = item.top + 0.5 * (1 + label.vertical) * item.height;

    let adjust = 0.2; 
    let pX = 0.5 * (1 - (1 + adjust) * label.horizontal * label.placement);
    let pY = 0.5 * (1 - (1 + adjust) * label.vertical * label.placement);

    mapped.scale.set(label.baseScale, label.baseScale);
    mapped.position.set(x * scale, y * scale);
    mapped.anchor.set(pX, pY);

    item.labels = mapped;
    return mapped;
  }

  /**
   * (Re)render all of the label definitions.
   */
  renderLabels(item: ViewNode): any {
    let style = item.style;
    if (!style) return; // no style
    let labels: any = style.labels;
    if (!labels) return; // no label

    let scale = item.parent ? item.parent.scale : 1;

    if (labels.length) {
      labels = labels as Label[];
      for (let l of labels)
        this.renderLabel(l, item, scale);
    } else {
      this.renderLabel(labels as Label, item, scale);
    }
  }

  renderShape(style: Style, ctx: PIXI.Graphics, item: ViewNode) {
    let fill = this.getColor(style.fill);
    let stroke = this.getColor(style.stroke);

    const l = item.left, t = item.top, w = item.width, h = item.height;

    /*
    if (stroke) {
      ctx.lineStyle(4, 0xf);
    } else {
      ctx.lineStyle();
    }
    */

    ctx.lineStyle(3, 0x2222222);
    if (fill) ctx.beginFill(fill);

    switch (style.shape.type) {
      case Shapes.SQUARE,
        Shapes.RECTANGLE:
        ctx.drawRect(l, t, w, h);
        break;

      case Shapes.CIRCLE:
        let radius = w / 2;
        ctx.drawCircle(l + radius, t + radius, w / 2);
        break;

      case Shapes.DIAMOND:
        ctx.moveTo(l + w / 2, t);
        ctx.lineTo(l + w, t + h / 2);
        ctx.lineTo(l + w / 2, t + h);
        ctx.lineTo(l, t + h / 2);
        break;

      case Shapes.TRIANGLE:
        ctx.moveTo(l + w / 2, t);
        ctx.lineTo(l, t + h);
        ctx.lineTo(l + w, t + h);
        break;

      case Shapes.ROUNDED:
        let a = style.shape.a || 12;
        ctx.drawRoundedRect(l, t, w, h, a);
        break;

      case Shapes.HOURGLASS:
        let thin = .2, f = .12;
        ctx.moveTo(l + f * w, t);
        ctx.lineTo(l + w * (1 - f), t);
        ctx.lineTo(l + w / (2 - thin), t + h / 2);
        ctx.lineTo(l + w * (1 - f), t + h);
        ctx.lineTo(l + f * w, t + h);
        ctx.lineTo(l + w / (2 + thin), t + h / 2);
        ctx.lineTo(l + f * w, t);
        break;

      default: console.warn('Tried to render unknown shape class (' + style.shape.type + ')')
        break;
    }

    if (fill) ctx.endFill();
  }

  cacheShape(style: Style) {
    if (style.cachedImage) return;
    let canvas = document.createElement('canvas') as any;
    canvas.width = 16;
    canvas.height = 16;

    let ctx = canvas.getContext('2d');

    ctx.fillStyle = style.fill;

    switch (style.shape.type) {
      case Shapes.SQUARE, Shapes.RECTANGLE:
        ctx.fillRect(0, 0, 16, 16);
        break;

      case Shapes.TRIANGLE:
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(8, 0);
        ctx.lineTo(16, 16);
        ctx.closePath();
        ctx.fill();
        break;

      case Shapes.CIRCLE:
        ctx.beginPath();
        ctx.arc(8, 8, 8, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        break;

      case Shapes.ROUNDED:
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

      case Shapes.HOURGLASS:
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

      case Shapes.DIAMOND:
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

  renderItem(item: ViewItem, visual: any): any {
    if (item.visual) {
      return;
    } else {
      // let visual = new PIXI.Graphics();
      let style = item.style;
      this.renderShape(style, visual, item);
      item.visual = visual;
    }
  }

  renderGroup(group: ViewGroup, topLevel: boolean, oblique: boolean): any {
    if (group.visual) return;

    let root = new XContainer(group);

    if (!topLevel) {
      root.position.set(group.left, group.top);
    }

    let shape = new PIXI.Graphics();
    root.shape = shape;

    if (oblique) {
      shape.beginFill(Colors.grey);
      shape.drawRoundedRect(0, 0, group.width, group.height, 12);
      shape.endFill();
    } else if (!topLevel) {
      shape.lineStyle(16, Colors.grey);
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

  attach(node: ViewNode, group: ViewGroup) {
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
  'goldenrod': 0xDAA520,
  'darkgrey': 0xA9A9A9,
  'darkgray': 0xA9A9A9,
  'gray': 0xAAAAAA,
  'grey': 0xAAAAAA,
  'lightgray': 0xD3D3D3,
  'lightgrey': 0xD3D3D3,
  'black': 0x111111,
  'lightblack': 0x222222,
  'white': 0xffffff,
  'blue': 0x0074D9,
  'navy': 0x001f3f,
  'aqua': 0x7FDBFF,
  'teal': 0x39CCCC,
  'green': 0x2ECC40,
  'lime': 0x01FF70,
  'yellow': 0xFFDC00,
  'orange': 0xFF851B,
  'red': 0xFF4136,
  'maroon': 0x85144b,
  'fuchsia': 0xF012BE,
  'purple': 0xB10DC9,
  'silver': 0xDDDDDD
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

  constructor(text: string, definition: Label) {
    super(text, definition.cache, 0.2);
    this.baseScale = definition.baseScale;
    this.lowerScale = definition.lowerScale;
    this.upperScale = definition.upperScale;
  }
}

/**
 * Helper class for maintaining backlinks to the
 * originating group node.
 */
export class XContainer extends PIXI.Container {
  origin: ViewGroup;
  shape: PIXI.Graphics;
  content: PIXI.Container;

  constructor(group: ViewGroup) {
    super();
    this.width = group.width;
    this.height = group.height;
    this.origin = group;
  }
}