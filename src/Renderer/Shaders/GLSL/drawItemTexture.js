import { shaderLibrary } from '../../ShaderLibrary.js'

import './glslutils.js'

import drawItemTexture from './drawItemTexture.glsl'
import drawItemId from './drawItemId.glsl'

shaderLibrary.setShaderModule('drawItemId.glsl', drawItemId)
shaderLibrary.setShaderModule('drawItemTexture.glsl', drawItemTexture)
