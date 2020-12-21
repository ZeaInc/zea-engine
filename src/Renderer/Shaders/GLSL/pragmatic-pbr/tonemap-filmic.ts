import { shaderLibrary } from '../../../ShaderLibrary.js'

shaderLibrary.setShaderModule(
  'pragmatic-pbr/tonemap-filmic.glsl',
  `

//Based on Filmic Tonemapping Operators http://filmicgames.com/archives/75
vec3 tonemapFilmic(vec3 color) {
    vec3 x = max(vec3(0.0), color - 0.004);
    return (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06);
}

`
)
