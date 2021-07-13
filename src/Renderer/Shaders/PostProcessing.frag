
precision highp float;

import 'exposure.glsl'
import 'tonemap-filmic.glsl'
import 'gamma.glsl'

import 'fxaa.glsl'

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
}