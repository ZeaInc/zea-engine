import { shaderLibrary } from '../../../ShaderLibrary.js'

import glslAtmosphere from './snippets/glsl-atmosphere.glsl'
// https://github.com/wwwtyro/glsl-atmosphere
shaderLibrary.setShaderModule('wwwtyro/glsl-atmosphere.glsl', glslAtmosphere)
