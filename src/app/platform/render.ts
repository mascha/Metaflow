import {Style} from '../common/styling';
import {Shape, ShapeType} from '../common/shapes';


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

  renderShape(style: Style, ctx: PIXI.Graphics) {
    switch (style.shape.type) {
       case ShapeType.SQUARE, 
            ShapeType.RECTANGLE:   
        break;

      case ShapeType.CIRCLE:
        break;

      case ShapeType.ROUNDED:
        break;

      case ShapeType.HOURGLASS:
        break;

      default: console.warn('Tried to render unknown shape class (' + style.shape.type + ')')
        break;
     }
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
        ctx.lineTo(16-r, 0);
        ctx.quadraticCurveTo(16, 0, 16, r);
        ctx.lineTo(16, 16-r);
        ctx.quadraticCurveTo(16, 16, 16-r, 16);
        ctx.lineTo(r, 16);
        ctx.quadraticCurveTo(0, 16, 0, 16-r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fill();
        break;

      case ShapeType.HOURGLASS:
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(14,0);
        ctx.lineTo(2,16);
        ctx.lineTo(14,16);
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