/* eslint-disable require-jsdoc */
import { Color } from '../../Math/Color'
import { Registry } from '../../Registry'
import { GLShader } from '../GLShader.js'

import './GLSL/index'
import vert from './Lines.vert'
import frag from './Lines.frag'
class LinesShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl, 'LinesShader')
    this.setShaderStage('VERTEX_SHADER', vert)
    this.setShaderStage('FRAGMENT_SHADER', frag)
    this.finalize()
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({ name: 'BaseColor', defaultValue: new Color(1.0, 1.0, 0.5) })
    paramDescs.push({ name: 'Opacity', defaultValue: 0.7 })
    paramDescs.push({ name: 'Overlay', defaultValue: 0.000001 }) // Provide a slight overlay so lines draw over meshes.
    paramDescs.push({ name: 'StippleScale', defaultValue: 0.01 })

    // Note: a value of 0.0, means no stippling (solid). A value of 1.0 means invisible.
    // Any value in between determines how much of the solid line is removed.
    paramDescs.push({ name: 'StippleValue', defaultValue: 0, range: [0, 1] })
    paramDescs.push({ name: 'OccludedStippleValue', defaultValue: 1.0, range: [0, 1] })
    return paramDescs
  }

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
    // Note: By avoiding calling this value 'Opacity', the lines will not be considered 'Transparent'
    // Lines do not need to be depth sorted....
    matData[4] = material.getParameter('Opacity').getValue()
    matData[5] = material.getParameter('Overlay').getValue()
    matData[6] = material.getParameter('StippleScale').getValue()
    matData[7] = material.getParameter('StippleValue').getValue()

    matData[8] = material.getParameter('OccludedStippleValue').getValue()
    return matData
  }
}

Registry.register('LinesShader', LinesShader)
export { LinesShader }
