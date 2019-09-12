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
import { GLFbo } from './GLFbo.js';

class GLBaseViewport extends ParameterOwner {
  constructor(renderer) {
    super();
    this.__renderer = renderer;

    this.__backgroundColorParam = this.addParameter(
      new ColorParameter('BackgroundColor', new Color('#808080'))
    );
    this.__backgroundColorParam.valueChanged.connect(mode => {
      if (this.__fbo) {
        const color = this.__backgroundColorParam.getValue();
        this.__fbo.setClearColor(color.asArray());
      }
    });
    this.__doubleClickTimeMSParam = this.addParameter(
      new NumberParameter('DoubleClickTimeMS', 200)
    );
    this.__fbo = undefined;
    this.updated = new Signal();
    this.resized = new Signal();
  }

  getRenderer() {
    return this.__renderer;
  }

  getName() {
    return this.__name;
  }

  getBl() {
    return this.__bl;
  }
  setBl(bl) {
    this.__bl = bl;
    this.resize(this.__canvasWidth, this.__canvasHeight);
  }

  getTr() {
    return this.__tr;
  }
  setTr(tr) {
    this.__tr = tr;
    this.resize(this.__canvasWidth, this.__canvasHeight);
  }

  getPosX() {
    return this.__x;
  }
  getPosY() {
    return this.__y;
  }
  getWidth() {
    return this.__width;
  }

  getHeight() {
    return this.__height;
  }

  getBackground() {
    return this.__backgroundTexture
      ? this.__backgroundTexture
      : this.__backgroundColorParam.getValue();
  }

  setBackground(background) {
    const gl = this.__renderer.gl;
    if (background instanceof BaseImage) {
      if (background.type === 'FLOAT') {
        this.__backgroundTexture = background;
        this.__backgroundGLTexture = new GLHDRImage(gl, background);
      } else {
        this.__backgroundTexture = background;
        this.__backgroundGLTexture = new GLTexture2D(gl, background);
      }
    } else if (background instanceof Color) {
      if (this.__backgroundGLTexture) {
        this.__backgroundGLTexture.destroy();
        this.__backgroundGLTexture = undefined;
        this.__backgroundTexture = undefined;
      }
      this.__backgroundColorParam.setValue(background);
    } else {
      console.warn('Invalid background:' + background);
    }
    this.updated.emit();
  }

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
  onMouseDown(event) {
    return false;
  }
  onMouseUp(event) {
    return false;
  }
  onMouseMove(event) {
    return false;
  }
  onMouseLeave(event) {
    return false;
  }
  onKeyPressed(key, event) {
    return false;
  }
  onKeyDown(key, event) {
    return false;
  }
  onKeyUp(key, event) {
    return false;
  }
}

export { GLBaseViewport };
// export default GLBaseViewport;
