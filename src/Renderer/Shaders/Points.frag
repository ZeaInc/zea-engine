
precision highp float;

#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;

#endif

import 'GLSLUtils.glsl'
import 'drawItemTexture.glsl'
import 'cutaways.glsl'
import 'materialparams.glsl'

#if defined(DRAW_GEOMDATA)

uniform int floatGeomBuffer;
uniform int passId;

import 'GLSLBits.glsl'

#elif defined(DRAW_HIGHLIGHT)

#ifdef ENABLE_FLOAT_TEXTURES
vec4 getHighlightColor(int id) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 4);
}
#else // ENABLE_FLOAT_TEXTURES

uniform vec4 highlightColor;

vec4 getHighlightColor() {
  return highlightColor;
}

#endif // ENABLE_FLOAT_TEXTURES

#endif // DRAW_HIGHLIGHT

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
/* VS Outputs */

#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  //////////////////////////////////////////////
  // Color
#if defined(DRAW_COLOR)

#ifdef ENABLE_MULTI_DRAW

  vec2 materialCoords = v_geomItemData.zw;
  vec4 baseColor = getMaterialValue(materialCoords, 0);
  vec4 matValue1 = getMaterialValue(materialCoords, 1);
  float pointSize       = baseColor.a * matValue1.r;
  float overlay      = matValue1.g;

#else // ENABLE_MULTI_DRAW

  vec4 baseColor = BaseColor;

#endif // ENABLE_MULTI_DRAW

  fragColor = baseColor;

  //////////////////////////////////////////////
  // GeomData
#elif defined(DRAW_GEOMDATA)

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
    fragColor.r = mod(v_drawItemId, 256.) / 256.;
    fragColor.g = (floor(v_drawItemId / 256.) + (float(passId) * 64.)) / 256.;


    // encode the dist as a 16 bit float
    vec2 float16bits = encode16BitFloatInto2xUInt8(viewDist);
    fragColor.b = float16bits.x;
    fragColor.a = float16bits.y;
  }

  //////////////////////////////////////////////
  // Highlight
#elif defined(DRAW_HIGHLIGHT)
  
  int drawItemId = int(v_drawItemId + 0.5);
  fragColor = getHighlightColor(drawItemId);

#endif // DRAW_HIGHLIGHT


#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
