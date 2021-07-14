 
precision highp float;

varying vec2 v_texCoord;
uniform sampler2D ldrSampler;
uniform sampler2D cdmSampler;
uniform vec4 srcRegion; // pos, and size of the source region

import 'unpackHDR.glsl'

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif

    vec2 srcUv = srcRegion.xy + (v_texCoord * srcRegion.zw);

    fragColor = vec4(decodeHDR(ldrSampler, cdmSampler, srcUv), 1.0);

#ifndef ENABLE_ES3
    gl_FragColor = fragColor;
#endif
}

