import { SystemDesc } from '../../SystemDesc.js'
import { Vec3, Quat, Xfo, Mat4 } from '../../Math/index'
import { TreeItem } from '../../SceneTree/index'

/** Class representing a VR controller. */
class VRController {
  /**
   * Create a VR controller.
   * @param {any} xrvp - The Vr viewport.
   * @param {any} inputSource - The input source.
   * @param {any} id - The id value.
   */
  constructor(xrvp, inputSource, id) {
    this.xrvp = xrvp
    this.__inputSource = inputSource
    this.id = id

    // /////////////////////////////////
    // Xfo

    this.__mat4 = new Mat4()
    this.__xfo = new Xfo()

    // this.setVisible(true);

    this.__treeItem = new TreeItem('VRController:' + inputSource.handedness + id)
    // Controller coordinate system
    // X = Horizontal.
    // Y = Up.
    // Z = Towards handle base.

    if (!SystemDesc.isMobileDevice) {
      // A Vive or Oculus Controller
      this.__tip = new TreeItem('Tip')
      // Note: the tip of the controller need to be off
      // the end of the controller. getGeomItemAtTip
      // now searches a grid in that area and so we need to
      // ensure that the grid does not touch the controller,
      // else it will return the controller geom from
      // the getGeomItemAtTip function
      const tipXfo = new Xfo()
      tipXfo.tr.set(0.0, -0.05, -0.13)
      // Flip the tip around so +z is forwards.
      // tipXfo.ori.setFromAxisAndAngle(new Vec3(0, 1, 0), Math.PI)
      this.__tip.getParameter('LocalXfo').setValue(tipXfo)
      this.__treeItem.addChild(this.__tip, false)
      xrvp.getTreeItem().addChild(this.__treeItem)

      this.__activeVolumeSize = 0.04

      if (inputSource.targetRayMode == 'tracked-pointer') {
        // Once we have an input profile, we can determine the XR Device in use.
        switch (inputSource.profiles[0]) {
          case 'htc-vive':
            localStorage.setItem('ZeaEngine_XRDevice', 'Vive')
            break
          case 'oculus-touch':
          case 'oculus-touch-v2':
          case 'oculus-touch-v3':
            localStorage.setItem('ZeaEngine_XRDevice', 'Oculus')
            break
          default:
            break
        }

        //   // Use the fetchProfile method from the motionControllers library
        //   // to find the appropriate glTF mesh path for this controller.
        //   fetchProfile(inputSource, DEFAULT_PROFILES_PATH).then(({ profile, assetPath }) => {
        //     // Typically if you wanted to animate the controllers in response
        //     // to device inputs you'd create a new MotionController() instance
        //     // here to handle the animation, but this sample will skip that
        //     // and only display a static mesh for simplicity.
        //     scene.inputRenderer.setControllerMesh(new Gltf2Node({ url: assetPath }), inputSource.handedness)
        //   })
        xrvp.loadHMDResources().then((assetItem) => {
          if (!assetItem) return
          let srcControllerTree
          if (inputSource.profiles[0] == 'htc-vive') {
            srcControllerTree = assetItem.getChildByName('Controller')
          } else {
            switch (inputSource.handedness) {
              case 'left':
                srcControllerTree = assetItem.getChildByName('LeftController')
                break
              case 'right':
                srcControllerTree = assetItem.getChildByName('RightController')
                break
              case 'none':
              case 'left-right':
              case 'left-right-none':
                srcControllerTree = assetItem.getChildByName('Controller')
                break
              default:
                break
            }
          }
          if (srcControllerTree) {
            const controllerTree = srcControllerTree.clone({ assetItem })
            controllerTree.getParameter('LocalXfo').setValue(
              new Xfo(
                new Vec3(0, 0.0, 0.0),
                new Quat({ setFromAxisAndAngle: [new Vec3(0, 1, 0), Math.PI] }),
                new Vec3(0.001, 0.001, 0.001) // VRAsset units are in mm.
              )
            )
            this.__treeItem.addChild(controllerTree, false)
          }
        })
      }
    }

    this.tick = 0
  }

  /**
   * The getHandedness method.
   * @return {any} - The return value.
   */
  getHandedness() {
    return this.__inputSource.handedness
  }

  /**
   * The getId method.
   * @return {any} - The return value.
   */
  getId() {
    return this.id
  }

  /**
   * The getTreeItem method.
   * @return {any} - The return value.
   */
  getTreeItem() {
    return this.__treeItem
  }

  /**
   * The getTipItem method.
   * @return {any} - The return value.
   */
  getTipItem() {
    return this.__tip
  }

  /**
   * The getTipXfo method.
   * @return {any} - The return value.
   */
  getTipXfo() {
    return this.__tip.getParameter('GlobalXfo').getValue()
  }

  /**
   * The getTouchPadValue method.
   * @return {any} - The return value.
   */
  getTouchPadValue() {
    return this.__touchpadValue
  }

  /**
   * The isButtonPressed method.
   * @return {boolean} - The return value.
   */
  isButtonPressed() {
    return this.__buttonPressed
  }

  /**
   * The getControllerStageLocalXfo method.
   * @return {any} - The return value.
   */
  getControllerStageLocalXfo() {
    return this.__xfo
  }

  /**
   * The getControllerTipStageLocalXfo method.
   * @return {any} - The return value.
   */
  getControllerTipStageLocalXfo() {
    return this.__xfo.multiply(this.__tip.getParameter('LocalXfo').getValue())
  }

  // ////////////////////////////////

  /**
   * The updatePose method.
   * @param {any} refSpace - The refSpace value.
   * @param {any} xrFrame - The xrFrame value.
   * @param {any} inputSource - The inputSource value.
   * @param {any} event - The event object.
   */
  updatePose(refSpace, xrFrame, inputSource, event) {
    const inputPose = xrFrame.getPose(inputSource.gripSpace, refSpace)

    // We may not get a inputPose back in cases where the input source has lost
    // tracking or does not know where it is relative to the given frame
    // of reference.
    if (!inputPose || !inputPose.transform) {
      return
    }

    this.__mat4.setDataArray(inputPose.transform.matrix)
    this.__xfo.fromMat4(this.__mat4)

    // const pos = inputPose.transform.position;
    // this.__xfo.tr.set(pos.x, pos.y,pos.z);
    // const ori = inputPose.transform.orientation;
    // this.__xfo.ori.set(ori.x, ori.y, ori.z, ori.x);
    // //////////////////////////////

    this.__treeItem.getParameter('LocalXfo').setValue(this.__xfo)

    // Reset the geom at tip so it will be recomuted if necessary
    this.__geomAtTip = undefined
    this.__hitTested = false

    // /////////////////////////////////
    // Simulate Pointer Enter/Leave Events.
    // Check for pointer over every Nth frame (at 90fps this should be fine.)
    if (this.tick % 5 == 0 && !event.getCapture()) {
      const intersectionData = this.getGeomItemAtTip()
      if (intersectionData != undefined) {
        event.intersectionData = intersectionData
        if (intersectionData.geomItem != this.pointerOverItem) {
          if (this.pointerOverItem) {
            this.pointerOverItem.onPointerLeave(event)
          }
          this.pointerOverItem = intersectionData.geomItem
          event.geomItem = intersectionData.geomItem
          this.pointerOverItem.onPointerEnter(event)
        }

        // emit the pointer move event directly to the item.
        intersectionData.geomItem.onPointerMove(event)
      } else if (this.pointerOverItem) {
        event.leftGeometry = this.pointerOverItem
        this.pointerOverItem.onPointerLeave(event)
        this.pointerOverItem = null
      }
    }
    this.tick++
  }

  // ////////////////////////////////

  /**
   * The getGeomItemAtTip method.
   * @return {any} - The return value.
   */
  getGeomItemAtTip() {
    if (this.__hitTested) return this.__intersectionData
    this.__hitTested = true

    const renderer = this.xrvp.getRenderer()
    const xfo = this.__tip.getParameter('GlobalXfo').getValue()
    const vol = this.__activeVolumeSize
    this.__intersectionData = renderer.raycastWithXfo(xfo, vol, vol)
    return this.__intersectionData
  }
}

export { VRController }
