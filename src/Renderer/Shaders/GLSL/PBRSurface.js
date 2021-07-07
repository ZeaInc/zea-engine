import { shaderLibrary } from '../../ShaderLibrary.js'

// Note: this is just for backwards compatibility for the ZeaCAD plugin to not throw exception at load time.
shaderLibrary.setShaderModule('GGX_Specular.glsl', ` `)

import SHCoeffs from './SHCoeffs.glsl'
import PBRSurfaceRadiance from './PBRSurfaceRadiance.glsl'
shaderLibrary.setShaderModule('SHCoeffs.glsl', SHCoeffs)

shaderLibrary.setShaderModule('PBRSurfaceRadiance.glsl', PBRSurfaceRadiance)
