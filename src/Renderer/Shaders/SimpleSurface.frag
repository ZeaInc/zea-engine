precision highp float;
#ifdef ENABLE_MULTI_DRAW
// #define DEBUG_GEOM_ID
#endif


import 'GLSLUtils.glsl'
import 'drawItemTexture.glsl'
import 'cutaways.glsl'
import 'gamma.glsl'
import 'materialparams.glsl'


#ifdef DEBUG_GEOM_ID
import 'debugColors.glsl'
#endif

uniform color cutColor;

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
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif
varying vec3 v_worldPos;
/* VS Outputs */

uniform mat4 cameraMatrix;
uniform int isOrthographic;

#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;
uniform float Opacity;
uniform float EmissiveStrength;

#ifdef ENABLE_TEXTURES
uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;
uniform sampler2D OpacityTex;
uniform int OpacityTexType;
uniform sampler2D EmissiveStrengthTex;
uniform int EmissiveStrengthTexType;
#endif // ENABLE_TEXTURES

#endif // ENABLE_MULTI_DRAW

import 'computeViewNormal.glsl'
  

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif

void main(void) {
  int drawItemId = int(v_drawItemId + 0.5);

  int flags = int(v_geomItemData.r + 0.5);
  // Cutaways
  if (testFlag(flags, GEOMITEM_FLAG_CUTAWAY)) 
  {
    vec4 cutAwayData   = getCutaway(drawItemId);
    vec3 planeNormal = cutAwayData.xyz;
    float planeDist = cutAwayData.w;
    if (cutaway(v_worldPos, planeNormal, planeDist)) {
      discard;
      return;
    }
    else if (!gl_FrontFacing) {
#ifdef ENABLE_ES3
  fragColor = cutColor;
#else
  gl_FragColor = cutColor;
#endif
      return;
    }
  }

  //////////////////////////////////////////////
  // Normals
  
  vec3 viewNormal;
  if (length(v_viewNormal) < 0.1) {
    viewNormal = computeViewNormal(v_viewPos);
  } else {
    viewNormal = normalize(v_viewNormal);
  }
  vec3 normal = normalize(mat3(cameraMatrix) * viewNormal);
  
  vec3 viewVector;
  if (isOrthographic == 0)
    viewVector = normalize(mat3(cameraMatrix) * normalize(v_viewPos));
  else 
    viewVector = vec3(-cameraMatrix[2][0], -cameraMatrix[2][1], -cameraMatrix[2][2]);
  
  //////////////////////////////////////////////
  // Material

#ifdef ENABLE_MULTI_DRAW

  vec2 materialCoords = v_geomItemData.zw;
  vec4 baseColor = toLinear(getMaterialValue(materialCoords, 0));
  vec4 matValue1 = getMaterialValue(materialCoords, 1);
  float opacity       = baseColor.a * matValue1.r;
  float emission      = matValue1.g;

#else // ENABLE_MULTI_DRAW

#ifndef ENABLE_TEXTURES
  vec4 baseColor      = toLinear(BaseColor);
  float emission      = EmissiveStrength;
  float opacity       = baseColor.a * Opacity;
#else
  vec4 baseColor      = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, v_textureCoord);
  float opacity       = baseColor.a * getLuminanceParamValue(Opacity, OpacityTex, OpacityTexType, v_textureCoord);
  float emission      = getLuminanceParamValue(EmissiveStrength, EmissiveStrengthTex, EmissiveStrengthTexType, v_textureCoord);
#endif

#endif // ENABLE_MULTI_DRAW

  // Hacky simple irradiance. 
  float ndotv = dot(normal, viewVector);
  if (ndotv < 0.0) {
    normal = -normal;
    ndotv = dot(normal, viewVector);

    // Note: these 2 lines can be used to debug inverted meshes.
    //baseColor = vec4(1.0, 0.0, 0.0, 1.0);
    //ndotv = 1.0;
  }

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif
  fragColor = vec4((ndotv * baseColor.rgb) + (emission * baseColor.rgb), opacity);

#ifdef DEBUG_GEOM_ID
  if (testFlag(flags, GEOMITEM_INVISIBLE_IN_GEOMDATA)) {
    discard;
    return;
  }

  // ///////////////////////
  // Debug Draw ID (this correlates to GeomID within a GLGeomSet)
  float geomId = v_geomItemData.w;
  fragColor.rgb = getDebugColor(geomId);
  // ///////////////////////
#endif

#ifdef ENABLE_INLINE_GAMMACORRECTION
  fragColor.rgb = toGamma(fragColor.rgb);
#endif

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
