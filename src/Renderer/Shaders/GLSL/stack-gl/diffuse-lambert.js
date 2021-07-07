import { shaderLibrary } from '../../../ShaderLibrary.js'

import lambert from './snippets/diffuse-lambert.glsl'
shaderLibrary.setShaderModule('stack-gl/diffuse-lambert.glsl', lambert)
