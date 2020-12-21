import { shaderLibrary } from '../../../ShaderLibrary.js'

shaderLibrary.setShaderModule(
  'stack-gl/gamma.glsl',
  `

const float gamma_const = 2.2;

float toLinear(float v) {
  return pow(v, gamma_const);
}

vec2 toLinear(vec2 v) {
  return pow(v, vec2(gamma_const));
}

vec3 toLinear(vec3 v) {
  return pow(v, vec3(gamma_const));
}

vec4 toLinear(vec4 v) {
  return vec4(toLinear(v.rgb), v.a);
}


float toGamma(float v) {
  return pow(v, 1.0 / gamma_const);
}

vec2 toGamma(vec2 v) {
  return pow(v, vec2(1.0 / gamma_const));
}

vec3 toGamma(vec3 v) {
  return pow(v, vec3(1.0 / gamma_const));
}

vec4 toGamma(vec4 v) {
  return vec4(toGamma(v.rgb), v.a);
}

float toGamma(float v, float gamma) {
  return pow(v, 1.0 / gamma);
}

vec2 toGamma(vec2 v, float gamma) {
  return pow(v, vec2(1.0 / gamma));
}

vec3 toGamma(vec3 v, float gamma) {
  return pow(v, vec3(1.0 / gamma));
}

vec4 toGamma(vec4 v, float gamma) {
  return vec4(toGamma(v.rgb, gamma), v.a);
}


`
)
