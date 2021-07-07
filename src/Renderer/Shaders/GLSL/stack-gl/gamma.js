import { shaderLibrary } from '../../../ShaderLibrary.js'
import gamma from './snippets/gamma.glsl'

shaderLibrary.setShaderModule('stack-gl/gamma.glsl', gamma)
