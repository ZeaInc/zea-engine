
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="envmap-octahedral.glsl"/>
<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>


uniform color envMap;
uniform sampler2D envMapTex;
uniform int envMapTexType;


uniform float exposure;

/* VS Outputs */
varying vec3 v_worldDir;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec2 texCoord = dirToSphOctUv(normalize(v_worldDir));
  vec4 env = getColorParamValue(envMap, envMapTex, envMapTexType, texCoord);

  fragColor = vec4(env.rgb/env.a, 1.0);

#ifdef ENABLE_INLINE_GAMMACORRECTION
  fragColor.rgb = toGamma(fragColor.rgb * exposure);
#endif

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
