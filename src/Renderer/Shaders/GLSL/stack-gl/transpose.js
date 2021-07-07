import { shaderLibrary } from '../../../ShaderLibrary.js'
import transpose from './snippets/transpose.glsl'
shaderLibrary.setShaderModule('stack-gl/transpose.glsl', transpose.toString()) // TODO: .toString is used here to make tests pass, jest doesn't like glsl.
