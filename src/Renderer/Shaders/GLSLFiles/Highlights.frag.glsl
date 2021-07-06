
precision highp float;

uniform float outlineThickness;
uniform sampler2D highlightDataTexture;
uniform vec2 highlightDataTextureSize;

varying vec2 v_texCoord;


vec3 SobelFactor(vec3 ldc, vec3 ldl, vec3 ldr, vec3 ldu, vec3 ldd)
{
    return abs(ldl - ldc) +
        abs(ldr - ldc) +
        abs(ldu - ldc) +
        abs(ldd - ldc);
}

// https://github.com/ssell/UnitySobelOutline/blob/2e1f4a5b4e703ae2c96aaf08d5518ce58abbaab9/Assets/Resources/Shaders/SobelOutlineHLSL.shader#L18
vec4 SobelSample(vec2 uv)
{
    vec3 offset = vec3((1.0 / highlightDataTextureSize.x), (1.0 / highlightDataTextureSize.y), 0.0) * outlineThickness;

    vec4 pixelCenter = texture2D(highlightDataTexture, uv);
    vec3 pixelLeft   = texture2D(highlightDataTexture, uv - offset.xz).rgb;
    vec3 pixelRight  = texture2D(highlightDataTexture, uv + offset.xz).rgb;
    vec3 pixelUp     = texture2D(highlightDataTexture, uv + offset.zy).rgb;
    vec3 pixelDown   = texture2D(highlightDataTexture, uv - offset.zy).rgb;

    vec3 sobelNormalVec = SobelFactor(pixelCenter.rgb, pixelLeft, pixelRight, pixelUp, pixelDown);
    
    float sobelNormal = sobelNormalVec.x + sobelNormalVec.y + sobelNormalVec.z;
    
    float outlineDepthMultiplier = 10.0;
    float outlineDepthBias = 2.5;
    sobelNormal = pow(sobelNormal * outlineDepthMultiplier, outlineDepthBias);

    sobelNormal = clamp(sobelNormal, 0.0, 1.0);

    
    float pixelCenterWeight = length(pixelCenter.rgb) > 0.0 ? 1.0 : 0.0;
    float pixelLeftWeight   = length(pixelLeft) > 0.0 ? 1.0 : 0.0;
    float pixelRightWeight  = length(pixelRight) > 0.0 ? 1.0 : 0.0;
    float pixelUpWeight     = length(pixelUp) > 0.0 ? 1.0 : 0.0;
    float pixelDownWeight   = length(pixelDown) > 0.0 ? 1.0 : 0.0;
    
    // Weight each neighbors contribution to the current pixel color.
    pixelCenter.rgb = pixelCenter.rgb * pixelCenterWeight;
    pixelLeft   *= pixelLeftWeight;
    pixelRight  *= pixelRightWeight;
    pixelUp     *= pixelUpWeight;
    pixelDown   *= pixelDownWeight;

    // Add all the weighted contributions, and then normalize.
    vec3 outlineColor = pixelCenter.rgb + pixelLeft + pixelRight +  pixelUp + pixelDown;
    outlineColor /= pixelCenterWeight + pixelLeftWeight + pixelRightWeight + pixelUpWeight + pixelDownWeight;

    return mix(vec4(outlineColor, sobelNormal), pixelCenter, pixelCenter.a);
}


#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {
    
    vec4 outlineColor = SobelSample(v_texCoord);

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

