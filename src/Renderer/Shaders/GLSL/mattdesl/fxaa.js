import { shaderLibrary } from '../../../ShaderLibrary'

import fxaaTexcoords from './snippets/fxaa-texcoords.glsl'
import fxaa from './snippets/fxaa.glsl'
import fxaaApply from './snippets/fxaa-apply.glsl'

shaderLibrary.setShaderModule('mattdesl/fxaa-texcoords.glsl', fxaaTexcoords)

shaderLibrary.setShaderModule('mattdesl/fxaa.glsl', fxaa)

shaderLibrary.setShaderModule('mattdesl/fxaa-apply.glsl', fxaaApply)
