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

#ifdef ENABLE_INLINE_GAMMACORRECTION
uniform float exposure;
#endif

uniform mat4 cameraMatrix;
uniform int isOrthographic;

#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;
uniform float AmbientOcclusion;
uniform float Roughness;
uniform float Metallic;
uniform float Reflectance;
uniform float EmissiveStrength;
uniform float Opacity;

#ifdef ENABLE_TEXTURES
uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;

uniform sampler2D AmbientOcclusionTex;
uniform int AmbientOcclusionTexType;

#ifdef ENABLE_PBR
uniform sampler2D RoughnessTex;
uniform int RoughnessTexType;

uniform sampler2D MetallicTex;
uniform int MetallicTexType;

uniform sampler2D ReflectanceTex;
uniform int ReflectanceTexType;

uniform sampler2D NormalTex;
uniform int NormalTexType;
#endif // ENABLE_PBR

uniform sampler2D EmissiveStrengthTex;
uniform int EmissiveStrengthTexType;

#endif // ENABLE_TEXTURES
#endif // ENABLE_MULTI_DRAW

import 'PBRSurfaceRadiance.glsl'

#ifdef ENABLE_PBR
mat3 cotangentFrame( in vec3 normal, in vec3 pos, in vec2 texCoord ) {
  // https://stackoverflow.com/questions/5255806/how-to-calculate-tangent-and-binormal
  vec3 n = normal;
  // derivations of the fragment position
  vec3 pos_dx = dFdx( pos );
  vec3 pos_dy = dFdy( pos );
  // derivations of the texture coordinate
  vec2 texC_dx = dFdx( texCoord );
  vec2 texC_dy = dFdy( texCoord );
  // tangent vector and binormal vector
  vec3 t = -(texC_dy.y * pos_dx - texC_dx.y * pos_dy);
  vec3 b = -(texC_dx.x * pos_dy - texC_dy.x * pos_dx);

  t = t - n * dot( t, n ); // orthonormalization ot the tangent vectors
  b = b - n * dot( b, n ); // orthonormalization of the binormal vectors to the normal vector
  b = b - t * dot( b, t ); // orthonormalization of the binormal vectors to the tangent vector
  mat3 tbn = mat3( normalize(t), normalize(b), n );

  return tbn;
}
#endif

import 'computeViewNormal.glsl'


#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {
  int drawItemId = int(v_drawItemId + 0.5);

  int flags = int(v_geomItemData.r + 0.5);
  // Cutaways
  if (testFlag(flags, GEOMITEM_FLAG_CUTAWAY)) {
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
    
  if (dot(normal, viewVector) < 0.0) {
      normal = -normal;
      // Note: this line can be used to debug inverted meshes.
      //material.baseColor = vec3(1.0, 0.0, 0.0);
  }

  //////////////////////////////////////////////
  // Material

  MaterialParams material;

#ifdef ENABLE_MULTI_DRAW
  vec2 materialCoords = v_geomItemData.zw;
  vec4 matValue0      = getMaterialValue(materialCoords, 0);
  vec4 matValue1      = getMaterialValue(materialCoords, 1);
  vec4 matValue2      = getMaterialValue(materialCoords, 2);

  material.baseColor     = toLinear(matValue0.rgb);
  material.ambientOcclusion      = matValue1.r;
  material.metallic      = matValue1.g;
  material.roughness     = matValue1.b;
  material.reflectance   = matValue1.a;

  material.emission         = matValue2.r;
  material.opacity          = matValue2.g * matValue0.a;

#else // ENABLE_MULTI_DRAW

#ifndef ENABLE_TEXTURES
  material.baseColor     = toLinear(BaseColor.rgb);
  material.emission      = EmissiveStrength;

#ifdef ENABLE_PBR
  material.roughness     = Roughness;
  material.metallic      = Metallic;
  material.reflectance   = Reflectance;
#endif

#else
  // Planar YZ projection for texturing, repeating every meter.
  // vec2 texCoord       = v_worldPos.xz * 0.2;
  vec2 texCoord          = v_textureCoord;

  vec4 baseColor         = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, texCoord);
  material.ambientOcclusion = getLuminanceParamValue(AmbientOcclusion, AmbientOcclusionTex, AmbientOcclusionTexType, texCoord);
  material.baseColor     = baseColor.rgb;
  
#ifdef ENABLE_PBR

  material.metallic      = getLuminanceParamValue(Metallic, MetallicTex, MetallicTexType, texCoord);
  material.roughness     = getLuminanceParamValue(Roughness, RoughnessTex, RoughnessTexType, texCoord);

  // TODO: Communicate that this tex contains the roughness as well.
  if (MetallicTexType != 0) {
    vec4 metallicRoughness = vec4(Metallic, Roughness, 0.0, 1.0);
    metallicRoughness     = texture2D(MetallicTex, texCoord);
    material.roughness     = metallicRoughness.g;
    material.metallic     = metallicRoughness.b;
  }

  material.reflectance   = getLuminanceParamValue(Reflectance, ReflectanceTex, ReflectanceTexType, texCoord);
#endif // ENABLE_PBR
  material.emission         = getLuminanceParamValue(EmissiveStrength, EmissiveStrengthTex, EmissiveStrengthTexType, texCoord);
#endif // ENABLE_TEXTURES
  material.opacity       = Opacity * baseColor.a;

#ifdef ENABLE_TEXTURES
#ifdef ENABLE_PBR
  if (NormalTexType != 0) {
      mat3 tbn = cotangentFrame(normal, viewVector, texCoord);
      normal = normalize(tbn * (texture2D(NormalTex, texCoord).rgb * 2.0 - 1.0));
  }
#endif // ENABLE_PBR
#endif // ENABLE_TEXTURES
#endif // ENABLE_MULTI_DRAW

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  fragColor = pbrSurfaceRadiance(material, normal, viewVector);
  // fragColor = vec4(texture2D(NormalTex, texCoord).rgb, 1.0);
  // fragColor = metallicRoughness;
  // fragColor = vec4(material.baseColor, 1.0);;
  // fragColor = vec4(vec3(material.metallic), 1.0);;
  // fragColor = vec4(vec3(material.roughness), 1.0);;
  // fragColor = vec4(vec3(material.ambientOcclusion), 1.0);
  
#ifdef DEBUG_GEOM_ID
  // ///////////////////////
  // Debug Draw ID (this correlates to GeomID within a GLGeomSet)
  float geomId = v_geomItemData.w;
  fragColor.rgb = getDebugColor(geomId);
  // ///////////////////////
#endif


#ifdef ENABLE_INLINE_GAMMACORRECTION
  fragColor.rgb = toGamma(fragColor.rgb * exposure);
#endif

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
