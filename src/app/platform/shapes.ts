import {Style} from '../common/styling';

/**
 * Responsible for rendering style shapes
 * as cacheable bitmaps.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export default class ShapeRenderer {

  private images: any;
  private urls: any;
 
  private cacheShape(style: Style, canvas: HTMLCanvasElement) {
     canvas.width = 16;
     canvas.height = 16;

     canvas.fill = 'cornflowerblue';
     canvas.fillRect(0,0,16,16);
  }

  getImage(style: Style): HTMLCanvasElement {
     if (!style) return style;
     let image = this.images[style];
     if (image) {
       return image;
     } else {
       image = document.createElement('canvas');
       this.cacheShape(style, image);
       return image;
     }
  }

  getUrl(style: Style): string {
     if (!style) return style;
     let url = this.urls[style];
     if (url) {
       return url;
     } else {
       let image = this.getImage(style);
       url = image.toDataUrl();
       this.urls[style] = image;
       return url;
     }
  }

  removeStyle(style: Style) {
    if (!style) return style;
    let image = this.images[style];
    if (image) {
      let url = this.urls[style];
      if (url) {
        this.urls[style] = undefined;
      }
      this.images[style] = undefined;
    } 
  }
}