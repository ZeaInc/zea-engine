import { ParameterOwner } from '../ParameterOwner.js'

/**
 * Abstract class representing a tool with methods representing mouse, keyboard, touch and VR events.
 *
 * **Events**
 * * **installChanged:** Triggered when the tool is installed or uninstalled.
 * * **activatedChanged:** Triggered when a tool is activated or deactivated.
 *
 * @extends ParameterOwner
 */
class BaseTool extends ParameterOwner {
  /**
   * Creates an instance of BaseTool.
   */
  constructor() {
    super()
    this.__activated = false
  }

  /**
   * Enables tools usage.
   */
  activateTool() {
    if (this.__activated) throw new Error('Tool already activate')
    this.__activated = true
    this.emit('activatedChanged', { activated: this.__activated })
  }

  /**
   * Disables tool usage.
   */
  deactivateTool() {
    this.__activated = false
    this.emit('activatedChanged', { activated: this.__activated })
  }

  // ///////////////////////////////////
  // Pointer events

  /**
   * Event fired when a pointing device button is pressed while the pointer is over the tool.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerDown(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when a pointing device is moved while the cursor's hotspot is inside it.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerMove(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when a pointing device button is released while the pointer is over the tool.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerUp(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when a pointing device button is double clicked on the tool.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerDoublePress(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when a mouse pointer enters the viewport
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerEnter(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when a mouse pointer leaves the viewport
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerLeave(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when the user rotates the pointing device wheel.
   *
   * @param {MouseEvent} event - The event param.
   */
  onWheel(event) {
    // console.warn('Implement me')
  }

  // ///////////////////////////////////
  // Keyboard events

  /**
   * Event fired when the user presses down a key on the keyboard.
   *
   * @param {KeyboardEvent} event - The event param.
   */
  onKeyDown(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when the user releases a key on the keyboard.
   *
   * @param {KeyboardEvent} event - The event param.
   */
  onKeyUp(event) {
    // console.warn('Implement me')
  }

  // ///////////////////////////////////
  // Touch events

  /**
   * Event fired when one or more touch points are placed on the touch surface over a tool.
   *
   * @param {TouchEvent} event - The event param.
   */
  onTouchStart(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when the one or more touch points are moved along the touch surface over a tool.
   *
   * @param {TouchEvent} event - The event param.
   */
  onTouchMove(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when one or more touch points are removed from the touch surface over a tool.
   *
   * @param {TouchEvent} event - The event param.
   */
  onTouchEnd(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when one or more touch points have been disrupted in an implementation-specific manner.
   *
   * @param {TouchEvent} event - The event param.
   */
  onTouchCancel(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when two continuos touch point are placed on the touch surface over a tool.
   *
   * @param {TouchEvent} event - The event param.
   */
  onDoubleTap(event) {
    // console.warn('Implement me')
  }

  // ///////////////////////////////////
  // VRController events

  /**
   * Event fired when a VR controller button is pressed over a tool.
   *
   * @param {object} event - The event param.
   */
  onVRControllerButtonDown(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when a VR controller button is released over a tool.
   *
   * @param {object} event - The event param.
   */
  onVRControllerButtonUp(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when a VR controller button is pressed twice over a tool.
   *
   * @param {object} event - The event param.
   */
  onVRControllerDoubleClicked(event) {
    // console.warn('Implement me')
  }

  /**
   * Event fired when a VR controller...
   *
   * @param {object} event - The event param.
   */
  onVRPoseChanged(event) {
    // console.warn('Implement me')
  }
}

export default BaseTool
export { BaseTool }
