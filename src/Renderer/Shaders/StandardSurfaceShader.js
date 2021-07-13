/* eslint-disable require-jsdoc */
import { Color } from '../../Math/index'
import { Registry } from '../../Registry'
import { GLShader } from '../GLShader.js'

import './GLSL/index'
import vert from './StandardSurface.vert'
import frag from './StandardSurface.frag'

/** A standard shader handling Opaque and transparent items and PBR rendering.
 * @extends GLShader
 * @private
 */
class StandardSurfaceShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)

    this.setShaderStage('FRAGMENT_SHADER', frag)
  }

  /**
   * Returns the parameters that this shader expects to be provided by the material.
   * Note: the Material method setShaderName will retrieve these parameter declarations
   * to initialize and configure the parameters for the Material instance.
   * @return {array} - an array of param declarations that the shader expects the material tp provide.
   */
  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    })
    paramDescs.push({ name: 'AmbientOcclusion', defaultValue: 1, range: [0, 1] })
    paramDescs.push({ name: 'Metallic', defaultValue: 0.05, range: [0, 1] })
    paramDescs.push({ name: 'Roughness', defaultValue: 0.5, range: [0, 1] })
    paramDescs.push({ name: 'Reflectance', defaultValue: 0.5, range: [0, 1] })
    paramDescs.push({ name: 'Normal', defaultValue: new Color(0.5, 0.5, 0.5) })
    paramDescs.push({
      name: 'EmissiveStrength',
      defaultValue: 0.0,
      range: [0, 1],
    })
    paramDescs.push({ name: 'Opacity', defaultValue: 1.0, range: [0, 1] })
    return paramDescs
  }

  /**
   * The bind method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   * @param {string} key - The key value.
   * @return {any} - The return value.
   */
  bind(renderstate, key) {
    super.bind(renderstate, key)

    const gl = this.__gl
    if (renderstate.envMap) {
      renderstate.envMap.bind(renderstate)
    }

    const { exposure } = renderstate.unifs
    if (exposure) {
      gl.uniform1f(exposure.location, renderstate.exposure)
    }
    return true
  }

  // /////////////////////////////
  // Parameters

  /**
   * The getPackedMaterialData method.
   * @param {any} material - The material param.
   * @return {any} - The return value.
   */
  static getPackedMaterialData(material) {
    const matData = new Float32Array(12)
    const baseColor = material.getParameter('BaseColor').getValue()
    matData[0] = baseColor.r
    matData[1] = baseColor.g
    matData[2] = baseColor.b
    matData[3] = baseColor.a

    matData[4] = material.getParameter('AmbientOcclusion').getValue()
    matData[5] = material.getParameter('Metallic').getValue()
    matData[6] = material.getParameter('Roughness').getValue()
    matData[7] = material.getParameter('Reflectance').getValue()

    matData[8] = material.getParameter('EmissiveStrength').getValue()
    matData[9] = material.getParameter('Opacity').getValue()
    return matData
  }

  static getGeomDataShaderName() {
    return 'StandardSurfaceGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'StandardSurfaceSelectedGeomsShader'
  }
}

Registry.register('StandardSurfaceShader', StandardSurfaceShader)
Registry.register('TransparentSurfaceShader', StandardSurfaceShader)
export { StandardSurfaceShader }
