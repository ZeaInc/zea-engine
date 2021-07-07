import { shaderLibrary } from '../../../ShaderLibrary'

import reinhard from './snippets/tonemap-reinhard.glsl'
shaderLibrary.setShaderModule('pragmatic-pbr/tonemap-reinhard.glsl', reinhard)
