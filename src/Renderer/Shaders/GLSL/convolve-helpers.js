import { shaderLibrary } from '../../ShaderLibrary.js'

import './envmap-octahedral.js'

import convolveHelpers from './convolve-helpers.glsl'
import Hammersley from './Hammersley.glsl'
import ImportanceSampleGGX from './ImportanceSampleGGX.glsl'

shaderLibrary.setShaderModule('Hammersley.glsl', Hammersley)
shaderLibrary.setShaderModule('ImportanceSampleGGX.glsl', ImportanceSampleGGX)
shaderLibrary.setShaderModule('convolve-helpers.glsl', convolveHelpers)
