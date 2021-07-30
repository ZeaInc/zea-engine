
precision highp float;

import 'GLSLBits.glsl'

uniform int floatGeomBuffer;
uniform int passId;

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
    

  float viewDist = length(v_viewPos);

  if (floatGeomBuffer != 0) {
    fragColor.r = float(passId); 
    fragColor.g = float(v_drawItemId);
    fragColor.b = 0.0;// TODO: store poly-id or something.
    fragColor.a = viewDist;
  }
  else {
    ///////////////////////////////////
    // UInt8 buffer
    fragColor.r = (mod(v_drawItemId, 256.) + 0.5) / 255.;
    fragColor.g = (floor(v_drawItemId / 256.) + 0.5) / 255.;

    // encode the dist as a 16 bit float
    vec2 float16bits = encode16BitFloatInto2xUInt8(viewDist);
    fragColor.b = float16bits.x;
    fragColor.a = float16bits.y;
  }


#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
