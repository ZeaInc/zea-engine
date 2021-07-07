import { shaderLibrary } from '../../ShaderLibrary.js'

import envmapOctahedral from './envmap-octahedral.glsl'

// https://gist.github.com/pyalot/cc7c3e5f144fb825d626
shaderLibrary.setShaderModule('envmap-octahedral.glsl', envmapOctahedral)
