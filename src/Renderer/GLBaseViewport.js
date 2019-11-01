import { Color } from '../Math';
import { Signal } from '../Utilities';
import {
  ParameterOwner,
  BaseImage,
  ColorParameter,
  NumberParameter,
} from '../SceneTree';
import { GLHDRImage } from './GLHDRImage.js';
import { GLTexture2D } from './GLTexture2D.js';

/** Class representing a GL base viewport.
 * @extends ParameterOwner
 */
class GLBaseViewport extends ParameterOwner {
  /**
   * Create a GL base viewport.
   * @param {any} renderer - The renderer value.
   */
  constructor(renderer) {
    super();
    this.__renderer = renderer;
    this.__doubleClickTimeMSParam = this.addParameter(
      new NumberParameter('DoubleClickTimeMS', 200)
    );
    this.__fbo = undefined;
    this.updated = new Signal();
    this.resized = new Signal();

    this.__renderer.sceneSet.connect(() => {
      const rp = renderer
        .getScene()
        .getRoot()
        .getChildByName('Renderer Params');

      const bgColorPAram = rp.getParameter('BackgroundColor');
      const processBGValue = mode => {
        const value = bgColorPAram.getValue();
        const gl = this.__renderer.gl;
        if (value instanceof BaseImage) {
          if (value.type === 'FLOAT') {
            this.__backgroundTexture = value;
            this.__backgroundGLTexture = new GLHDRImage(gl, value);
          } else {
            this.__backgroundTexture = value;
            this.__backgroundGLTexture = new GLTexture2D(gl, value);
          }
        } else if (value instanceof Color) {
          if (this.__backgroundGLTexture) {
            this.__backgroundGLTexture.destroy();
            this.__backgroundGLTexture = undefined;
            this.__backgroundTexture = undefined;
          }
          this.__backgroundColor = value;
        } else {
          console.warn('Invalid background:' + value);
        }
        this.updated.emit();
      };
      processBGValue(bgColorPAram.getValue());
      bgColorPAram.valueChanged.connect(processBGValue);
    });
  }

  /**
   * The getRenderer method.
   * @return {any} - The return value.
   */
  getRenderer() {
    return this.__renderer;
  }

  /**
   * The getName method.
   * @return {any} - The return value.
   */
  getName() {
    return this.__name;
  }

  /**
   * The getBl method.
   * @return {any} - The return value.
   */
  getBl() {
    return this.__bl;
  }

  /**
   * The setBl method.
   * @param {any} bl - The bl value.
   */
  setBl(bl) {
    this.__bl = bl;
    this.resize(this.__canvasWidth, this.__canvasHeight);
  }

  /**
   * The getTr method.
   * @return {any} - The return value.
   */
  getTr() {
    return this.__tr;
  }

  /**
   * The setTr method.
   * @param {any} tr - The tr value.
   */
  setTr(tr) {
    this.__tr = tr;
    this.resize(this.__canvasWidth, this.__canvasHeight);
  }

  /**
   * The getPosX method.
   * @return {any} - The return value.
   */
  getPosX() {
    return this.__x;
  }

  /**
   * The getPosY method.
   * @return {any} - The return value.
   */
  getPosY() {
    return this.__y;
  }

  /**
   * The getWidth method.
   * @return {any} - The return value.
   */
  getWidth() {
    return this.__width;
  }

  /**
   * The getHeight method.
   * @return {any} - The return value.
   */
  getHeight() {
    return this.__height;
  }

  /**
   * The getBackground method.
   * @return {any} - The return value.
   */
  getBackground() {
    const rp = this.__renderer
      .getScene()
      .getRoot()
      .getChildByName('Renderer Params');
    const bgColorPAram = rp.getParameter('BackgroundColor');
    return bgColorPAram.getValue();
  }

  /**
   * The setBackground method.
   * @param {any} background - The background value.
   */
  setBackground(background) {
    const rp = this.__renderer
      .getScene()
      .getRoot()
      .getChildByName('Renderer Params');
    const bgColorPAram = rp.getParameter('BackgroundColor');
    bgColorPAram.setValue(background);
    this.updated.emit();
  }

  /**
   * The resize method.
   * @param {any} width - The src value.
   * @param {any} height - The flags value.
   */
  resize(width, height) {
    this.__canvasWidth = width;
    this.__canvasHeight = height;
    this.__x = this.__canvasWidth * this.__bl.x;
    this.__y = this.__canvasWidth * this.__bl.y;
    this.__width =
      this.__canvasWidth * this.__tr.x - this.__canvasWidth * this.__bl.x;
    this.__height =
      this.__canvasHeight * this.__tr.y - this.__canvasHeight * this.__bl.y;
    this.region = [this.__x, this.__y, this.__width, this.__height];

    this.resized.emit();
  }

  // ///////////////////////////
  // Events

  /**
   * Causes an event to occur when a user presses a mouse button over an element.
   * @param {any} event - The event that occurs.
   * @return {boolean} - The return value.
   */
  onMouseDown(event) {
    return false;
  }

  /**
   * Causes an event to occur when a user releases a mouse button over a element.
   * @param {any} event - The event that occurs.
   * @return {boolean} - The return value.
   */
  onMouseUp(event) {
    return false;
  }

  /**
   * Causes an event to occur when the mouse pointer is moving while over an element.
   * @param {any} event - The event that occurs.
   * @return {boolean} - The return value.
   */
  onMouseMove(event) {
    return false;
  }

  /**
   * Causes an event to occur when the mouse pointer is moved out of an element.
   * @param {any} event - The event that occurs.
   * @return {boolean} - The return value.
   */
  onMouseLeave(event) {
    return false;
  }

  /**
   * Causes an event to occurs when the user presses a key on the keyboard.
   * @param {any} key - The key the user presses.
   * @param {any} event - The event that occurs.
   * @return {boolean} - The return value.
   */
  onKeyPressed(key, event) {
    return false;
  }

  /**
   * Causes an event to occur when the user is pressing a key on the keyboard.
   * @param {any} key - The key the user is pressing.
   * @param {any} event - The event that occurs.
   * @return {boolean} - The return value.
   */
  onKeyDown(key, event) {
    return false;
  }

  /**
   * Causes an event to occur  when the user releases a key on the keyboard.
   * @param {any} key - The key the user releases
   * @param {any} event - The event that occurs.
   * @return {boolean} - The return value.
   */
  onKeyUp(key, event) {
    return false;
  }
}

export { GLBaseViewport };
