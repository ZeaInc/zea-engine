
precision highp float;

import 'constants.glsl'

uniform color BaseColor;
uniform float Rounded;
uniform float BorderWidth;

/* VS Outputs */
varying vec2 v_texCoord;
varying vec3 v_viewPos;
varying float v_drawItemId;

#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  float dist = length(v_texCoord - 0.5);
  if (dist > 0.5)
    discard;
  if (dist > 0.5 - (BorderWidth * 0.5))
    fragColor = vec4(0.,0.,0.,1.);
  else {
    // Modulate the lighting using the texture coord so the point looks round.
    float NdotV = cos(dist * PI);

    fragColor = BaseColor * mix(1.0, NdotV, Rounded);
  }
  

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
