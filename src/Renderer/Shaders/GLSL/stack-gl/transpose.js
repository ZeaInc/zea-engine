import { shaderLibrary } from '../../../ShaderLibrary.js'
import transpose from './snippets/transpose.glsl'
shaderLibrary.setShaderModule('stack-gl/transpose.glsl', transpose)
