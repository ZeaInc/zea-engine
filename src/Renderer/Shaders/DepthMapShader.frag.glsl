 
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform float near;
uniform float far;

varying vec3 v_viewPos;

float linstep(float edge0, float edge1, float value){
  return clamp((value-edge0)/(edge1-edge0), 0.0, 1.0);
}

void main(void) {
  float depth = linstep(near, far, -v_viewPos.z);
  //gl_FragColor = vec4(depth, depth, depth,  1.0);

  float dx = dFdx(depth);
  float dy = dFdy(depth);
  gl_FragColor = vec4(depth, pow(depth, 2.0) + 0.25*(dx*dx + dy*dy), 0.0, 1.0);
}
