import { shaderLibrary } from '../../../ShaderLibrary.js'
import gamma from './snippets/gamma.glsl'

shaderLibrary.setShaderModule('stack-gl/gamma.glsl', gamma.toString()) // TODO: .toString is used here to make tests pass, jest doesn't like glsl.
