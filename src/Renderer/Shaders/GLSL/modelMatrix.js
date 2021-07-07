import { shaderLibrary } from '../../ShaderLibrary.js'

import './glslutils.js'
import './drawItemTexture.js'

import modelMatrix from './modelMatrix.glsl'

shaderLibrary.setShaderModule('modelMatrix.glsl', modelMatrix)
