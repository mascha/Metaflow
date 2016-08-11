import {Style} from '../common/styling';

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

     /* actually draw the representation */
     let ctx = canvas.getContext('2d');
     ctx.fillStyle = 'cornflowerblue';
     ctx.fillRect(0, 0, 16, 16);

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