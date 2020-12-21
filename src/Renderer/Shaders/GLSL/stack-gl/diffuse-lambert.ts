import { shaderLibrary } from '../../../ShaderLibrary.js'

shaderLibrary.setShaderModule(
  'stack-gl/diffuse-lambert.glsl',
  `

float lambertDiffuse(
  vec3 lightDirection,
  vec3 surfaceNormal
) {
  return max(0.0, dot(lightDirection, surfaceNormal));
}

`
)
