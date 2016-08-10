import {Style} from '../common/styling';

/**
 * Responsible for rendering style shapes
 * as cacheable bitmaps.
 * 
 * @author Martin Schade
 * @since 1.0.0
 */
export default class ShapeRenderer {

  private cache: any;

  public renderSimple(style: Style): HTMLCanvasElement {
      return document.createElement('canvas');
  }
}