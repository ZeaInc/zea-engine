import { Color, Xfo } from '../../Math/index'
import { Sphere } from '../../SceneTree/Geometry/Shapes'
import { GeomItem } from '../../SceneTree/GeomItem'
import { Material } from '../../SceneTree/Material'

import { BaseTool } from '../../SceneTree/Manipulators/BaseTool'
import { POINTER_TYPES } from '../../Utilities/EnumUtils'

/**
 * Class representing a view tool
 * @extends BaseTool
 */
class VRViewManipulator extends BaseTool {
  /**
   */
  constructor(xrvp) {
    super()

    this.__controllerTriggersHeld = []

    this.xrvp = xrvp
    this.vrControllerToolTip = new Sphere(0.02 * 0.75)
    this.vrControllerToolTipMat = new Material('Cross', 'FlatSurfaceShader')
    this.vrControllerToolTipMat.getParameter('BaseColor').setValue(new Color('#03E3AC'))
    this.addIconToController = this.addIconToController.bind(this)
  }

  // /////////////////////////////////////
  //

  /**
   * Adds the icon to the tip of the VR Controller
   * @param {object} event
   * @private
   */
  addIconToController(event) {
    const { controller } = event
    const geomItem = new GeomItem('HandleToolTip', this.vrControllerToolTip, this.vrControllerToolTipMat)
    geomItem.setSelectable(false)
    controller.getTipItem().removeAllChildren()
    controller.getTipItem().addChild(geomItem, false)
  }

  /**
   * The activateTool method.
   */
  activateTool() {
    super.activateTool()

    for (const controller of this.xrvp.getControllers()) {
      this.addIconToController({ controller })
    }
    this.xrvp.on('controllerAdded', this.addIconToController)
  }

  /**
   * The deactivateTool method.
   */
  deactivateTool() {
    super.deactivateTool()

    for (const controller of this.xrvp.getControllers()) {
      controller.getTipItem().removeAllChildren()
    }
    this.xrvp.off('controllerAdded', this.addIconToController)
  }

  // ///////////////////////////////////
  // VRController events

  // eslint-disable-next-line require-jsdoc
  __initMoveStage() {
    if (this.__controllerTriggersHeld.length == 1) {
      this.__grabPos = this.__controllerTriggersHeld[0].getControllerTipStageLocalXfo().tr.clone()
      this.stageXfo__GrabStart = this.xrvp.getXfo().clone()
      this.__invOri = this.stageXfo__GrabStart.ori.inverse()
    } else if (this.__controllerTriggersHeld.length == 2) {
      const p0 = this.__controllerTriggersHeld[0].getControllerTipStageLocalXfo().tr
      const p1 = this.__controllerTriggersHeld[1].getControllerTipStageLocalXfo().tr
      this.__grabDir = p1.subtract(p0)
      this.__grabPos = p0.lerp(p1, 0.5)
      this.__grabDir.y = 0.0
      this.__grabDist = this.__grabDir.length()
      this.__grabDir.scaleInPlace(1 / this.__grabDist)
      this.stageXfo__GrabStart = this.xrvp.getXfo().clone()
      this.__grab_to_stage = this.__grabPos.subtract(this.stageXfo__GrabStart.tr)
    }
  }

  /**
   * The onVRControllerButtonDown method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onVRControllerButtonDown(event) {
    if (event.button != 1) return
    this.__controllerTriggersHeld.push(event.controller)
    this.__initMoveStage()
    event.stopPropagation()
  }

  /**
   * The onVRControllerButtonUp method.
   * @param {any} event - The event param.
   * @return {any} The return value.
   */
  onVRControllerButtonUp(event) {
    if (event.button != 1) return
    const index = this.__controllerTriggersHeld.indexOf(event.controller)
    this.__controllerTriggersHeld.splice(index, 1)
    this.__initMoveStage()
    event.stopPropagation()
  }

  /**
   * The onVRControllerDoubleClicked method.
   * @param {any} event - The event param.
   */
  onVRControllerDoubleClicked(event) {
    console.log('onVRControllerDoubleClicked:', this.__controllerTriggersHeld.length)

    const stageXfo = this.xrvp.getXfo().clone()
    stageXfo.sc.set(1, 1, 1)
    this.xrvp.setXfo(stageXfo)
  }

  /**
   * The onVRPoseChanged method.
   * @param {any} event - The event param.
   */
  onVRPoseChanged(event) {
    if (this.__controllerTriggersHeld.length == 1) {
      const grabPos = this.__controllerTriggersHeld[0].getControllerTipStageLocalXfo().tr

      const deltaXfo = new Xfo()
      deltaXfo.tr = this.__grabPos.subtract(grabPos)

      // //////////////
      // Update the stage Xfo
      const stageXfo = this.stageXfo__GrabStart.multiply(deltaXfo)
      this.xrvp.setXfo(stageXfo)
    } else if (this.__controllerTriggersHeld.length == 2) {
      const p0 = this.__controllerTriggersHeld[0].getControllerTipStageLocalXfo().tr
      const p1 = this.__controllerTriggersHeld[1].getControllerTipStageLocalXfo().tr

      const grabPos = p0.lerp(p1, 0.5)
      const grabDir = p1.subtract(p0)
      grabDir.y = 0.0
      const grabDist = grabDir.length()
      grabDir.scaleInPlace(1 / grabDist)

      const deltaXfo = new Xfo()

      // //////////////
      // Compute sc
      // Limit to a 10x change in scale per grab.
      const sc = Math.max(Math.min(this.__grabDist / grabDist, 10.0), 0.1)

      // Avoid causing a scale that would make the user < 1.0 scale factor.
      // if(stageSc < 1.0){
      //     sc = 1.0 / this.stageXfo__GrabStart.sc.x;
      // }
      deltaXfo.sc.set(sc, sc, sc)

      // //////////////
      // Compute ori
      let angle = this.__grabDir.angleTo(grabDir)
      if (this.__grabDir.cross(grabDir).y > 0.0) {
        angle = -angle
      }
      deltaXfo.ori.rotateY(angle)

      // Rotate around the point between the hands.
      const oriTrDelta = deltaXfo.ori.rotateVec3(this.__grabPos)
      deltaXfo.tr.addInPlace(this.__grabPos.subtract(oriTrDelta))

      // Scale around the point between the hands.
      const deltaSc = this.__grabPos.scale(1.0 - sc)
      deltaXfo.tr.addInPlace(deltaXfo.ori.rotateVec3(deltaSc))

      // //////////////
      // Compute tr
      // Not quite working.....
      const deltaTr = this.__grabPos.subtract(grabPos).scale(sc)
      deltaXfo.tr.addInPlace(deltaXfo.ori.rotateVec3(deltaTr))

      // //////////////
      // Update the stage Xfo
      const stageXfo = this.stageXfo__GrabStart.multiply(deltaXfo)
      this.xrvp.setXfo(stageXfo)
    }
  }

  // ///////////////////////////////////
  // Pointer events

  /**
   * Event fired when a pointing device button is pressed while the pointer is over the tool.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerDown(event) {
    if (event.pointerType === POINTER_TYPES.xr) {
      this.onVRControllerButtonDown(event)
    }
  }

  /**
   * Event fired when a pointing device is moved while the cursor's hotspot is inside it.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerMove(event) {
    if (event.pointerType === POINTER_TYPES.xr) {
      this.onVRPoseChanged(event)
    }
  }

  /**
   * Event fired when a pointing device button is released while the pointer is over the tool.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerUp(event) {
    if (event.pointerType === POINTER_TYPES.xr) {
      this.onVRControllerButtonUp(event)
    }
  }

  /**
   * Event fired when a pointing device button is double clicked on the tool.
   *
   * @param {MouseEvent} event - The event param.
   */
  onPointerDoublePress(event) {
    if (event.pointerType === POINTER_TYPES.xr) {
      this.onVRControllerDoubleClicked(event)
    }
  }
}

export { VRViewManipulator }
