
precision highp float;

import 'GLSLUtils.glsl'
#ifdef ENABLE_MULTI_DRAW
import 'drawItemTexture.glsl'
#endif // ENABLE_MULTI_DRAW

import 'gamma.glsl'
import 'materialparams.glsl'


#if defined(DRAW_COLOR)

#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;

#ifdef ENABLE_TEXTURES
uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;
#endif

#endif // ENABLE_MULTI_DRAW
#endif // DRAW_COLOR


/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif


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

#else // ENABLE_MULTI_DRAW

#ifndef ENABLE_TEXTURES
  vec4 baseColor = BaseColor;
#else
  vec4 baseColor      = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, v_textureCoord);
#endif

#endif // ENABLE_MULTI_DRAW

  fragColor = baseColor;

#ifdef ENABLE_INLINE_GAMMACORRECTION
  fragColor.rgb = toGamma(fragColor.rgb);
#endif

  //////////////////////////////////////////////
  // GeomData
#elif defined(DRAW_GEOMDATA)

  if (true) {
    discard;
    return;
  }

  fragColor = vec4(-1, -1, -1, 0);

#endif // DRAW_GEOMDATA

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
