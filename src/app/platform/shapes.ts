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
     let shape = style.shape;

     canvas.width = 16;
     canvas.height = 16;

     /* actually draw the representation */
     let ctx = canvas.getContext('2d');

     ctx.fillStyle = shape.fill;

     switch (type) {
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

      case ShapeType.HOURGLASS:
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(14,0);
        ctx.lineTo(2,14);
        ctx.lineTo(14,14);
        ctx.closePath();
        ctx.fill();
        break;

      default:
          console.warn('Tried to render unknown shape class (' + shape.type + ')')
        break;
     }

     this.images[style.styleId] = canvas;
  }

  getImage(style: Style): HTMLCanvasElement {
     let image = this.images[style.styleId];
     if (image) {
       return image;
     } else {
       image = document.createElement('canvas');
       this.cacheShape(style, image);
       return image;
     }
  }

  getUrl(style: Style): string {
    let id = style.styleId;
     let url = this.urls[id];
     if (url) {
       return url;
     } else {
       let image = this.getImage(style);
       url = image.toDataURL();
       this.urls[id] = image;
       return url;
     }
  }

  removeStyle(style: Style) {
    let id = style.styleId;
    let image = this.images[id];
    if (image) {
      let url = this.urls[id];
      if (url) {
        this.urls[id] = undefined;
      }
      this.images[id] = undefined;
    } 
  }
}