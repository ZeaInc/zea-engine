import { Color } from '../Math/index'
import { ParameterOwner, BaseImage, NumberParameter } from '../SceneTree/index'
import { GLHDRImage } from './GLHDRImage.js'
import { GLTexture2D } from './GLTexture2D.js'

/**
 * Class representing a GL base viewport.
 * @extends ParameterOwner
 * @private
 */
class GLBaseViewport extends ParameterOwner {
  __backgroundColor: any;
  __backgroundGLTexture: any;
  __backgroundTexture: any;
  __bl: any;
  __canvasHeight: any;
  __canvasWidth: any;
  __doubleClickTimeMSParam: any;
  __fbo: any;
  __height: any;
  __ongoingPointers: any;
  __renderer: any;
  __tr: any;
  __width: any;
  __x: any;
  __y: any;
  /**
   * Create a GL base viewport.
   * @param {GLRenderer} renderer - The renderer value.
   */
  constructor(renderer: any) {
    super()
    this.__renderer = renderer
    this.__doubleClickTimeMSParam = this.addParameter(new NumberParameter('DoubleClickTimeMS', 200))
    this.__fbo = undefined
    // Since there is not multi touch on `PointerEvent`, we need to store pointers pressed.
    this.__ongoingPointers = []

    const sceneSet = () => {
      const settings = renderer.getScene().settings
      const bgColorParam = settings.getParameter('BackgroundColor')
      const processBGValue = () => {
        const value = bgColorParam.getValue()
        const gl = this.__renderer.gl
        if (value instanceof BaseImage) {
          if (value.type === 'FLOAT') {
            this.__backgroundTexture = value
            this.__backgroundGLTexture = new GLHDRImage(gl, value)
          } else {
            this.__backgroundTexture = value
            this.__backgroundGLTexture = new GLTexture2D(gl, value)
          }
        } else if (value instanceof Color) {
          if (this.__backgroundGLTexture) {
            this.__backgroundGLTexture.destroy()
            this.__backgroundGLTexture = undefined
            this.__backgroundTexture = undefined
          }
          this.__backgroundColor = value
        } else {
          console.warn('Invalid background:' + value)
        }
        this.emit('updated', {})
      }
      processBGValue()
      bgColorParam.on('valueChanged', processBGValue)
    }

    this.__renderer.on('sceneSet', sceneSet)
  }

  /**
   * The getRenderer method.
   * @return {any} - The return value.
   */
  getRenderer() {
    return this.__renderer
  }

  /**
   * The getBl method.
   * @return {any} - The return value.
   */
  getBl() {
    return this.__bl
  }

  /**
   * The setBl method.
   * @param {any} bl - The bl value.
   */
  setBl(bl: any) {
    this.__bl = bl
    this.resize(this.__canvasWidth, this.__canvasHeight)
  }

  /**
   * The getTr method.
   * @return {any} - The return value.
   */
  getTr() {
    return this.__tr
  }

  /**
   * The setTr method.
   * @param {any} tr - The tr value.
   */
  setTr(tr: any) {
    this.__tr = tr
    this.resize(this.__canvasWidth, this.__canvasHeight)
  }

  /**
   * The getPosX method.
   * @return {any} - The return value.
   */
  getPosX() {
    return this.__x
  }

  /**
   * The getPosY method.
   * @return {any} - The return value.
   */
  getPosY() {
    return this.__y
  }

  /**
   * The getWidth method.
   * @return {any} - The return value.
   */
  getWidth() {
    return this.__width
  }

  /**
   * The getHeight method.
   * @return {any} - The return value.
   */
  getHeight() {
    return this.__height
  }

  /**
   * The getBackground method.
   * @return {any} - The return value.
   */
  getBackground() {
    console.warn('Deprecated Function. Please access the Scene Settings object.')
    const settings = this.__renderer.getScene().settings
    const bgColorParam = settings.getParameter('BackgroundColor')
    return bgColorParam.getValue()
  }

  /**
   * The setBackground method.
   * @param {any} background - The background value.
   */
  setBackground(background: any) {
    console.warn('Deprecated Function. Please access the Scene Settings object.')
    const settings = this.__renderer.getScene().settings
    const bgColorParam = settings.getParameter('BackgroundColor')
    bgColorParam.setValue(background)
    this.emit('updated', {})
  }

  /**
   * The resize method.
   * @param {any} canvasWidth - The canvasWidth value.
   * @param {any} canvasHeight - The canvasHeight value.
   */
  resize(canvasWidth: any, canvasHeight: any) {
    this.__canvasWidth = canvasWidth
    this.__canvasHeight = canvasHeight
    this.__width = canvasWidth
    this.__height = canvasHeight
    this.emit('resized', { width: this.__width, height: this.__height })
  }

  // ///////////////////////////
  // Events
  /**
   * Handler of the `pointerdown` event fired when the pointer device is initially pressed.
   *
   * @param {MouseEvent|TouchEvent} event - The DOM event produced by a pointer
   */
  onPointerDown(event: any) {
    console.warn('@GLBaseViewport#onPointerDown - Implement me!')
  }

  /**
   * Handler of the `pointerup` event fired when the pointer device is finally released.
   *
   * @param {MouseEvent|TouchEvent} event - The DOM event produced by a pointer
   */
  onPointerUp(event: any) {
    console.warn('@GLBaseViewport#onPointerUp - Implement me!')
  }

  /**
   * Handler of the `pointermove` event fired when the pointer device changes coordinates, and the pointer has not been cancelled
   *
   * @param {MouseEvent|TouchEvent} event - The DOM event produced by a pointer
   */
  onPointerMove(event: any) {
    console.warn('@GLBaseViewport#onPointerMove - Implement me!')
  }

  /**
   * Invoked when the mouse pointer is moved into this viewport.
   *
   * @param {MouseEvent|TouchEvent} event - The DOM event produced by a pointer
   */
  onPointerEnter(event: any) {
    console.warn('@GLBaseViewport#onPointerEnter - Implement me!')
  }

  /**
   * Invoked when the mouse pointer is moved out of this viewport.
   *
   * @param {MouseEvent|TouchEvent} event - The DOM event produced by a pointer
   */
  onPointerLeave(event: any) {
    console.warn('@GLBaseViewport#onPointerLeave - Implement me!')
  }

  /**
   * Invoked when the mouse pointer is moved out of an element.
   * @param {any} event - The event that occurs.
   * @return {boolean} - The return value.
   */
  onMouseLeave(event: any) {
    return false
  }

  /**
   * Invoked when the user is pressing a key on the keyboard.
   * @param {any} key - The key the user is pressing.
   * @param {any} event - The event that occurs.
   * @return {boolean} - The return value.
   */
  onKeyDown(event: any) {
    return false
  }

  /**
   * Causes an event to occur  when the user releases a key on the keyboard.
   * @param {any} key - The key the user releases
   * @param {any} event - The event that occurs.
   * @return {boolean} - The return value.
   */
  onKeyUp(event: any) {
    return false
  }

  /**
   *
   * @param {id} pointerId
   * @return {number} - index result of the find.
   */
  _getOngoingPointerIndexById(pointerId: any) {
    return this.__ongoingPointers.findIndex((pointer: any) => pointer.pointerId === pointerId);
  }
}

export { GLBaseViewport }
