import {Style} from '../common/styling';
import {Shape, ShapeType} from '../common/shapes';


/**
 * Responsible for rendering style shapes
 * as cacheable bitmaps.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export default class ShapeRenderer {

  private images = Object.create(null);
  private urls = Object.create(null);
 
  private cacheShape(style: Style, canvas: HTMLCanvasElement) {
     canvas.width = 16;
     canvas.height = 16;

     let ctx = canvas.getContext('2d');

     ctx.fillStyle = style.fill;

     switch (style.shape.type) {
       case ShapeType.SQUARE:     
        ctx.fillRect(2, 2, 14, 14);
        break;

      case ShapeType.RECTANGLE:
        ctx.fillRect(2, 4, 14, 12);
        break;

      case ShapeType.CIRCLE:
        ctx.beginPath();
        ctx.arc(8, 8, 6, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        break;

      case ShapeType.ROUNDED:
        ctx.beginPath();
        ctx.moveTo(4, 2);
        ctx.lineTo(12, 2);
        ctx.quadraticCurveTo(14, 2, 14, 4);
        ctx.lineTo(14,12);
        ctx.quadraticCurveTo(14, 14, 12, 14);
        ctx.lineTo(4, 14);
        ctx.quadraticCurveTo(2, 14, 2, 12);
        ctx.lineTo(2, 4);
        ctx.quadraticCurveTo(2, 2, 4, 2);
        ctx.closePath();
        break;

      case ShapeType.HOURGLASS:
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(14,0);
        ctx.lineTo(2,14);
        ctx.lineTo(14,14);
        ctx.closePath();
        ctx.fill();
        break;

      default: console.warn('Tried to render unknown shape class (' + style.shape.type + ')')
        break;
     }

     style.cachedImage = canvas;
  }
}