
precision highp float;

import 'GLSLUtils.glsl'
import 'constants.glsl'
import 'drawItemTexture.glsl'
import 'cutaways.glsl'
import 'gamma.glsl'
import 'materialparams.glsl'


uniform int occluded;

#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;
uniform float Opacity;

uniform float StippleScale;
uniform float StippleValue;
uniform float OccludedStippleValue;

#endif // ENABLE_MULTI_DRAW

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


#ifdef ENABLE_FLOAT_TEXTURES
vec4 getCutaway(int id) {
    return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 5);
}

#else

uniform vec4 cutawayData;

vec4 getCutaway(int id) {
    return cutawayData;
}

#endif

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_worldPos;
varying vec3 v_nextVertexDist;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  int drawItemId = int(v_drawItemId + 0.5);
  int flags = int(v_geomItemData.r + 0.5);

  // Cutaways
  if(testFlag(flags, GEOMITEM_FLAG_CUTAWAY)) 
  {
      vec4 cutAwayData   = getCutaway(drawItemId);
      vec3 planeNormal = cutAwayData.xyz;
      float planeDist = cutAwayData.w;
      if(cutaway(v_worldPos, planeNormal, planeDist)){
          discard;
          return;
      }
  }

  //////////////////////////////////////////////
  // Material

#ifdef ENABLE_MULTI_DRAW

  vec2 materialCoords = v_geomItemData.zw;
  vec4 BaseColor = getMaterialValue(materialCoords, 0);
  vec4 matValue1 = getMaterialValue(materialCoords, 1);
  vec4 matValue2 = getMaterialValue(materialCoords, 2);
  float Opacity  = matValue1.r;

  float StippleScale = matValue1.b;
  float StippleValue = matValue1.a;
  float OccludedStippleValue = matValue2.r;
#endif // ENABLE_MULTI_DRAW

  ///////////////////
  // Stippling
  float stippleValue = occluded == 0 ? StippleValue : OccludedStippleValue;
#ifdef ENABLE_ES3 // No stippling < es3 
  if (stippleValue > 0.0) {
    // Note: a value of 0.0, means no stippling (solid). A value of 1.0 means invisible
    float dist = -v_viewPos.z * StippleScale;
    float nextVertexDist = imod(int(floor(v_nextVertexDist.z)), 2) == 0 ? v_nextVertexDist.x : v_nextVertexDist.y;
    if (mod(nextVertexDist / dist, 1.0) < stippleValue) {
      discard;
      return;
    }
  }
#endif

  //////////////////////////////////////////////
  // Color
#if defined(DRAW_COLOR)

  fragColor = BaseColor;
  fragColor.a *= Opacity;

  
#ifndef ENABLE_ES3
  if (occluded == 1) fragColor.a *= 1.0 - stippleValue;
#endif

  //////////////////////////////////////////////
  // GeomData
#elif defined(DRAW_GEOMDATA)

  if(testFlag(flags, GEOMITEM_INVISIBLE_IN_GEOMDATA)) {
    discard;
    return;
  }
  
  float viewDist = length(v_viewPos);

  if(floatGeomBuffer != 0) {
    fragColor.r = float(passId); 
    fragColor.g = float(v_drawItemId);
    // Note: to make lines visually stand out from triangles
    // this value is 0.0 in the surface shaders.
    fragColor.b = 1.0;// TODO: store segment-id or something.
    fragColor.a = viewDist;
  } else {
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
  
  fragColor = getHighlightColor(drawItemId);

#endif // DRAW_HIGHLIGHT


#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
