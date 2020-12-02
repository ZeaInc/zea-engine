import { shaderLibrary } from '../../ShaderLibrary.js'

shaderLibrary.setShaderModule(
  'math/constants.glsl',
  `

#define PI 3.141592653589793
#define TwoPI (2.0 * PI)
#define HalfPI (0.5 * PI)




`
)
