import { shaderLibrary } from '../../ShaderLibrary.js'

import './ImageAtlas.js'

import imagePyramid from './imagePyramid.glsl'

shaderLibrary.setShaderModule('utils/imagePyramid.glsl', imagePyramid)
