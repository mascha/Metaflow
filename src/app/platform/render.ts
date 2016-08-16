import {Style} from '../common/styling';
import {Shape, ShapeType} from '../common/shapes';
import {ViewVertex} from '../common/viewmodel';

/**
 * Named color lookup dictionary
 */
let Colors = {
    'cornflowerblue': 0x6495ED,
    'mediumseagreen': 0x3CB371,
    'goldenrod': 0xDAA520,
    'darkgrey': 0xA9A9A9,
    'lightgray': 0xD3D3D3,
    'black': 0x000000,
    'white' : 0xffffff,
}

/**
 * Responsible for rendering style shapes
 * as cacheable bitmaps orr pixi graphics.
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
}