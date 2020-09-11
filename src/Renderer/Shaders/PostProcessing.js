import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/pragmatic-pbr/exposure.js'
import './GLSL/pragmatic-pbr/tonemap-filmic.js'
import './GLSL/mattdesl/fxaa.js'
import './GLSL/utils/quadVertexFromID.js'
import './GLSL/stack-gl/gamma.js'

class PostProcessing extends GLShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'PostProcessing.vertexShader',
      `
precision highp float;

<%include file="utils/quadVertexFromID.glsl"/>
<%include file="mattdesl/fxaa-texcoords.glsl"/>

uniform vec2 textureSize;

/* VS Outputs */
varying vec2 v_texCoord;

//texcoords computed in vertex step
//to avoid dependent texture reads
varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

 
void main()
{
    vec2 position = getQuadVertexPositionFromID();
    v_texCoord = position+0.5;
    gl_Position = vec4(position*2.0, 0.0, 1.0);

    vec2 fragCoord = v_texCoord * textureSize;
    texcoords(fragCoord, textureSize, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
}

`
    )
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'PostProcessing.fragmentShader',
      `
precision highp float;

<%include file="pragmatic-pbr/exposure.glsl"/>
<%include file="pragmatic-pbr/tonemap-filmic.glsl"/>
<%include file="stack-gl/gamma.glsl"/>

<%include file="mattdesl/fxaa.glsl"/>

//texcoords computed in vertex step
//to avoid dependent texture reads
varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

uniform sampler2D texture;
uniform vec2 textureSize;

uniform bool antialiase;
uniform bool tonemap;
uniform float exposure;
uniform float gamma;

varying vec2 v_texCoord;

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {
    //can also use gl_FragCoord.xy
    mediump vec2 fragCoord = v_texCoord * textureSize; 

    if (antialiase) {
        fragColor = fxaa(texture, fragCoord, textureSize, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
    } else {
        fragColor = texture2D(texture, v_texCoord);
    }
    
    //fragColor.rgb *= getStandardOutputBasedExposure(aperture, shutterSpeed, iso);
    fragColor.rgb *= exposure;
    
    if (tonemap) 
        fragColor.rgb = tonemapFilmic(fragColor.rgb);
    else
        fragColor.rgb = toGamma(fragColor.rgb, gamma);

    
    //fragColor.rgb = toGamma(fragColor.rgb, gamma);
    
    fragColor.a = 1.0;

#ifndef ENABLE_ES3
    gl_FragColor = fragColor;
#endif
}`
    )
    this.finalize()
  }
}

export { PostProcessing }
