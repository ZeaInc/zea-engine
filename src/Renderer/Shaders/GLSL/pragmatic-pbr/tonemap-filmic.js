import { shaderLibrary } from '../../../ShaderLibrary.js'

import toneMapFilmic from './snippets/tonemap-filmic.glsl'
shaderLibrary.setShaderModule('pragmatic-pbr/tonemap-filmic.glsl', toneMapFilmic)
