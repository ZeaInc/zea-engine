import { shaderLibrary } from '../../../ShaderLibrary'

import fxaaTexcoords from './fxaa_texcoords.glsl'
import fxaa from './fxaa.glsl'
import fxaaApply from './fxaaApply.glsl'

shaderLibrary.setShaderModule('mattdesl/fxaa-texcoords.glsl', fxaaTexcoords)

shaderLibrary.setShaderModule('mattdesl/fxaa.glsl', fxaa)

shaderLibrary.setShaderModule('mattdesl/fxaa-apply.glsl', fxaaApply)
