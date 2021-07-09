// seiji
precision highp float;
out vec4 fragColor;

// import 'GLSLUtils.glsl'
// import 'stack-gl/gamma.glsl'
// import 'materialparams.glsl'


import 'testSnippet/snippet.glsl'
import 'testSnippet/snippet2.glsl'

void main(void) {
  fragColor = vec4(rsnip_var,0.1,0.6,1.0);
}