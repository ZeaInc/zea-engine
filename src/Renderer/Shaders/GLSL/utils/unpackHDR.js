import { shaderLibrary } from '../../../ShaderLibrary.js'
import unpackHDR from './snippets/unpackHDR.glsl'
shaderLibrary.setShaderModule('utils/unpackHDR.glsl', unpackHDR)
