/* eslint-disable no-unused-vars */
import { Vec3, Box3, Xfo } from '../Math/index'
import { TreeItem } from './TreeItem.js'
import { BooleanParameter, NumberParameter } from './Parameters/index'
import { MathFunctions } from '../Utilities/MathFunctions'
import { Registry } from '../Registry'

/**
 * Represents a view of the scene vertex coordinates. Since it is a `TreeItem`,
 * translation modifiers are supported, so you can move the camera around.
 *
 * **Parameters**
 * * **isOrthographic(`BooleanParameter`):** Special type of view that represents 3D objects in two dimensions; `true` to enable.
 * * **fov(`NumberParameter`):** _todo_
 * * **near(`NumberParameter`):** _todo_
 * * **far(`NumberParameter`):** _todo_
 * * **focalDistance(`NumberParameter`):** _todo_
 *
 * **Events**
 * * **projectionParamChanged:** _todo_
 * * **movementFinished:** Triggered when framing all the objects.
 * @extends TreeItem
 */
class Camera extends TreeItem {
  /**
   * Instantiates a camera object, setting default configuration like zoom, target and positioning.
   *
   * @param {string} name - The name of the camera.
   */
  constructor(name = undefined) {
    if (name == undefined) name = 'Camera'
    super(name)

    this.__isOrthographicParam = this.addParameter(new BooleanParameter('isOrthographic', false))
    this.__fovParam = this.addParameter(new NumberParameter('fov', 1.0))
    this.__nearParam = this.addParameter(new NumberParameter('near', 0.1))
    this.__farParam = this.addParameter(new NumberParameter('far', 1000.0))
    this.__focalDistanceParam = this.addParameter(new NumberParameter('focalDistance', 5.0))

    // this.__viewMatParam = this.addParameter(new Parameter('viewMat', new Mat4()));
    // const _cleanViewMat = (xfo)=>{
    //     return this.__globalXfoParam.getValue().inverse().toMat4();
    // }
    // this.__globalXfoParam.on('valueChanged', (changeType)=>{
    //     this.__viewMatParam.setDirty(_cleanViewMat);
    // });

    const emitProjChanged = (event) => {
      this.emit('projectionParamChanged', event)
    }
    this.__isOrthographicParam.on('valueChanged', emitProjChanged)
    this.__fovParam.on('valueChanged', emitProjChanged)
    this.__nearParam.on('valueChanged', emitProjChanged)
    this.__farParam.on('valueChanged', emitProjChanged)

    // Initial viewing coords of a person standing 3 meters away from the
    // center of the stage looking at something 1 meter off the ground.
    this.setPositionAndTarget(new Vec3(3, 3, 1.75), new Vec3(0, 0, 1))
    this.setLensFocalLength('28mm')
  }

  // ////////////////////////////////////////////
  // Getters/setters.

  /**
   * Returns `near` parameter value.
   *
   * @return {number} - Returns the near value.
   */
  getNear() {
    return this.__nearParam.getValue()
  }

  /**
   * Sets `near` parameter value
   *
   * @param {number} value - The near value.
   */
  setNear(value) {
    this.__nearParam.setValue(value)
  }

  /**
   * Returns `far` parameter value.
   *
   * @return {number} - Returns the far value.
   */
  getFar() {
    return this.__farParam.getValue()
  }

  /**
   * Sets `far` parameter value
   *
   * @param {number} value - The far value.
   */
  setFar(value) {
    this.__farParam.setValue(value)
  }

  /**
   * Getter for the camera field of view (FOV).
   * The FOV is how much of the scene the camera can see at once.
   *
   * @return {number} - Returns the FOV value.
   */
  getFov() {
    return this.__fovParam.getValue()
  }

  /**
   * Setter for the camera field of view (FOV).
   * The FOV is how much of the scene the camera can see at once.
   *
   * @param {number} value - The FOV value.
   */
  setFov(value) {
    this.__fovParam.setValue(value)
  }

  /**
   * Setter for the camera lens focal length. Updates `fov` parameter value after a small math procedure.
   *
   * **Focal Lenth accepted values:** 10mm, 11mm, 12mm, 14mm, 15mm, 17mm, 18mm,
   * 19mm, 20mm, 24mm, 28mm, 30mm, 35mm, 45mm, 50mm, 55mm, 60mm, 70mm, 75mm, 80mm,
   * 85mm, 90mm, 100mm, 105mm, 120mm, 125mm, 135mm, 150mm, 170mm, 180mm, 210mm, 300mm,
   * 400mm, 500mm, 600mm, 800mm
   *
   * @param {string} value - The lens focal length value.
   */
  setLensFocalLength(value) {
    // https://www.nikonians.org/reviews/fov-tables
    const mapping = {
      '10mm': 100.4,
      '11mm': 95.0,
      '12mm': 90.0,
      '14mm': 81.2,
      '15mm': 77.3,
      '17mm': 70.4,
      '18mm': 67.4,
      '19mm': 64.6,
      '20mm': 61.9,
      '24mm': 53.1,
      '28mm': 46.4,
      '30mm': 43.6,
      '35mm': 37.8,
      '45mm': 29.9,
      '50mm': 27.0,
      '55mm': 24.6,
      '60mm': 22.6,
      '70mm': 19.5,
      '75mm': 18.2,
      '80mm': 17.1,
      '85mm': 16.1,
      '90mm': 15.2,
      '100mm': 13.7,
      '105mm': 13.0,
      '120mm': 11.4,
      '125mm': 11.0,
      '135mm': 10.2,
      '150mm': 9.1,
      '170mm': 8.1,
      '180mm': 7.6,
      '210mm': 6.5,
      '300mm': 4.6,
      '400mm': 3.4,
      '500mm': 2.7,
      '600mm': 2.3,
      '800mm': 1.7,
    }
    if (!value in mapping) {
      console.warn('Camera lense focal length not suported:' + value)
      return
    }
    this.__fovParam.setValue(MathFunctions.degToRad(mapping[value]))
  }

  /**
   * Returns `focalDistance` parameter value.
   *
   * @return {number} - Returns the lens focal length value..
   */
  getFocalDistance() {
    return this.__focalDistanceParam.getValue()
  }

  /**
   * Sets `focalDistance` parameter value.
   *
   * @errors on dist value lower or less than zero.
   * @param {number} dist - The focal distance value.
   */
  setFocalDistance(dist) {
    if (dist < 0.0001) console.error('Never set focal distance to zero')
    this.__focalDistanceParam.setValue(dist)
    this.__nearParam.setValue(dist * 0.01)
    this.__farParam.setValue(dist * 200.0)
  }

  /**
   * Returns `isOrthographic` parameter value.
   * @return {boolean} - The return value.
   */
  getIsOrthographic() {
    return this.__isOrthographicParam.getValue()
  }

  /**
   * Sets `focalDistance` parameter value.
   *
   * @param {boolean} value - The value param.
   */
  setIsOrthographic(value) {
    this.__isOrthographicParam.setValue(value)
  }

  /**
   * Setter for the camera postion and target.
   * As described at the start of the class, this is a `TreeItem`,
   * which means we can move it around using translation modifiers.
   * You can do it this way or using the changing `TreeItem` parameters,
   * although we recommend this one because it also changes focal distance.
   *
   * @param {Vec3} position - The position of the camera.
   * @param {Vec3} target - The target of the camera.
   */
  setPositionAndTarget(position, target) {
    this.setFocalDistance(position.distanceTo(target))
    const xfo = new Xfo()
    xfo.setLookAt(position, target, new Vec3(0.0, 0.0, 1.0))
    this.getParameter('GlobalXfo').setValue(xfo)
  }

  /**
   * Getter for the target position.
   * @return {Vec3} - Returns the target position.
   */
  getTargetPostion() {
    const focalDistance = this.__focalDistanceParam.getValue()
    const xfo = this.getParameter('GlobalXfo').getValue()
    const target = xfo.ori.getZaxis()
    target.scaleInPlace(-focalDistance)
    target.addInPlace(xfo.tr)
    return target
  }

  // ///////////////////////////

  /**
   * Calculates a new bounding box for all the items passed in `treeItems` array
   * and moves the camera to a point where we can see all of them, preserving parameters configurations.
   *
   * @param {GLBaseViewport} viewport - The viewport value.
   * @param {array} treeItems - The treeItems value.
   */
  frameView(viewport, treeItems) {
    const boundingBox = new Box3()
    for (const treeItem of treeItems) {
      boundingBox.addBox3(treeItem.getParameter('BoundingBox').getValue())
    }

    if (!boundingBox.isValid()) {
      console.warn('Bounding box not valid.')
      return
    }
    const focalDistance = this.__focalDistanceParam.getValue()
    const fovY = this.__fovParam.getValue()

    const globalXfo = this.getParameter('GlobalXfo').getValue().clone()
    const cameraViewVec = globalXfo.ori.getZaxis()
    const targetOffset = cameraViewVec.scale(-focalDistance)
    const currTarget = globalXfo.tr.add(targetOffset)
    const newTarget = boundingBox.center()

    const pan = newTarget.subtract(currTarget)
    globalXfo.tr.addInPlace(pan)

    // Transform the bounding box into camera space.
    const transformedBBox = new Box3()
    transformedBBox.addBox3(boundingBox, globalXfo.inverse())
    const camSpaceTarget = transformedBBox.center()

    const fovX = fovY * (viewport.getWidth() / viewport.getHeight())

    // p1 is the closest corner of the transformed bbox.
    const p = transformedBBox.p1
    const newFocalDistanceX = (Math.abs(p.x) / Math.tan(0.5 * fovX)) * 1.2
    const newFocalDistanceY = (Math.abs(p.y) / Math.tan(0.5 * fovY)) * 1.2

    const camSpaceBBoxDepth = (transformedBBox.p0.z - transformedBBox.p1.z) * -0.5
    const newFocalDistance = Math.max(newFocalDistanceX, newFocalDistanceY) + camSpaceBBoxDepth

    const dollyDist = newFocalDistance - focalDistance
    globalXfo.tr.addInPlace(cameraViewVec.scale(dollyDist))

    this.setFocalDistance(newFocalDistance)
    this.getParameter('GlobalXfo').setValue(globalXfo)
    this.emit('movementFinished')
  }

  /**
   * Sets camera perspective from a Mat4 object.
   *
   * @param {Mat4} mat - The mat value.
   * @param {number} aspect - The aspect value.
   */
  updateProjectionMatrix(mat, aspect) {
    const isOrthographic = this.__isOrthographicParam.getValue()
    const fov = this.__fovParam.getValue()
    const near = this.__nearParam.getValue()
    const far = this.__farParam.getValue()
    mat.setPerspectiveMatrix(fov, aspect, near, far)
  }
}

Registry.register('Camera', Camera)

export { Camera }
