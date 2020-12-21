import { GLShader } from '../GLShader.js'
import { shaderLibrary } from '../ShaderLibrary.js'

class OutlinesShader extends GLShader {
  constructor(gl: any) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'OutlinesShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;    //(location = 0)

/* VS Outputs */
varying vec2 v_texCoord;
 
void main()
{
    v_texCoord = positions.xy+0.5;
    gl_Position = vec4(positions.xy*2.0, 0.0, 1.0);
}

`
    )
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'OutlinesShader.fragmentShader',
      `
precision highp float;

uniform sampler2D highlightDataTexture;
uniform vec2 highlightDataTextureSize;

varying vec2 v_texCoord;


bool isFilledPixel(vec4 p) {
    return p.r > 0.01 || p.g > 0.01 || p.b > 0.01;
}
void accumOutlinePixel(vec2 fragCoord, inout vec4 res) {
    vec3 p = texture2D(highlightDataTexture, fragCoord/highlightDataTextureSize).rgb;
    if(p.r > 0.01 || p.g > 0.01 || p.b > 0.01) {
        res.r += p.r;
        res.g += p.g;
        res.b += p.b;
        res.a += 1.0;
    }
}
vec4 getOutlinePixelColor(vec2 fragCoord) {
    vec4 M = texture2D(highlightDataTexture, fragCoord/highlightDataTextureSize);
    
    /// To display a fill instead of an outline.
    // return M;

    if( isFilledPixel(M) ) {
        // Note: the filled pixel has an alpha value
        // that determines how much fill is applied
        // The outline is a solid color. 
        return M;
    }
    // Search surrounding pixels for selected geoms.
    vec4 res;
    accumOutlinePixel(fragCoord+vec2( 1, 1), res); // NW
    accumOutlinePixel(fragCoord+vec2(-1, 1), res); // NE
    accumOutlinePixel(fragCoord+vec2( 1,-1), res); // SW
    accumOutlinePixel(fragCoord+vec2(-1,-1), res); // SE
    accumOutlinePixel(fragCoord+vec2( 0, 2), res); // NN
    accumOutlinePixel(fragCoord+vec2(-2, 0), res); // EE
    accumOutlinePixel(fragCoord+vec2( 2, 0), res); // WW
    accumOutlinePixel(fragCoord+vec2( 0,-2), res); // SS
    accumOutlinePixel(fragCoord+vec2( 1, 2), res); // NNW
    accumOutlinePixel(fragCoord+vec2(-1, 2), res); // NNE
    accumOutlinePixel(fragCoord+vec2(-2, 1), res); // EEN
    accumOutlinePixel(fragCoord+vec2(-2,-1), res); // EES
    accumOutlinePixel(fragCoord+vec2( 2, 1), res); // WWN
    accumOutlinePixel(fragCoord+vec2( 2,-1), res); // WWS
    accumOutlinePixel(fragCoord+vec2( 1,-2), res); // SSW
    accumOutlinePixel(fragCoord+vec2(-1,-2), res); // SSE

    if(isFilledPixel(res))
        return vec4(res.rgb / res.a, 1.0);
    else
        return vec4(0.0, 0.0, 0.0, 0.0);
}


#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

    // fragColor = texture2D(highlightDataTexture, v_texCoord);;
    //can also use gl_FragCoord.xy
    mediump vec2 fragCoord = v_texCoord * highlightDataTextureSize; 
    /////////////////
    // Selection Outlines
    vec4 outlineColor = getOutlinePixelColor(fragCoord);
    if(outlineColor.a > 0.0001){
#ifndef ENABLE_ES3
        gl_FragColor = outlineColor;
#else
        fragColor = outlineColor;
#endif
    }
    else {
        discard;
    }
}

`
    )
  }
}

export { OutlinesShader }
