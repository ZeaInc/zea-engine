import { shaderLibrary } from '../../ShaderLibrary.js'

import './glslutils.js'

import imageAtlas from './imageAtlas.glsl'

shaderLibrary.setShaderModule('utils/imageAtlas.glsl', imageAtlas)
