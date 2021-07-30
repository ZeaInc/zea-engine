
#ifndef ENABLE_ES3
#extension GL_EXT_frag_depth: enable
#endif
precision highp float;

uniform sampler2D colorTexture;
uniform sampler2D depthTexture;
uniform vec2 screenSize;
uniform vec2 depthRange;

uniform float outlineThickness;
uniform color outlineColor;
uniform float outlineSensitivity;
uniform float outlineDepthBias;

varying vec2 v_texCoord;


// http://web.archive.org/web/20130416194336/http://olivers.posterous.com/linear-depth-in-glsl-for-real
float LinearEyeDepth(float z_b) {
  float z_n = 2.0 * z_b - 1.0;
  float z_e = 2.0 * depthRange.x * depthRange.y / (depthRange.y + depthRange.x - z_n * (depthRange.y - depthRange.x));
  return z_e;
}

float LogEyeDepth(float z_b) {
  return depthRange.x + ((depthRange.y - depthRange.x) * z_b);
}

// https://www.vertexfragment.com/ramblings/unity-postprocessing-sobel-outline/#depth-based-outline
// https://github.com/ssell/UnitySobelOutline/blob/2e1f4a5b4e703ae2c96aaf08d5518ce58abbaab9/Assets/Resources/Shaders/SobelOutlineHLSL.shader

float SobelDepth(float ldc, float ldl, float ldr, float ldu, float ldd)
{
  return abs(ldl - ldc) +
      abs(ldr - ldc) +
      abs(ldu - ldc) +
      abs(ldd - ldc);
}

float SobelSampleDepth(vec2 uv, vec3 offset)
{
  float pixelCenter = LinearEyeDepth(texture2D(depthTexture, uv).r);
  float pixelLeft   = LinearEyeDepth(texture2D(depthTexture, uv - offset.xz).r);
  float pixelRight  = LinearEyeDepth(texture2D(depthTexture, uv + offset.xz).r);
  float pixelUp     = LinearEyeDepth(texture2D(depthTexture, uv + offset.zy).r);
  float pixelDown   = LinearEyeDepth(texture2D(depthTexture, uv - offset.zy).r);

  float  outlineDepthMultiplier = (1.0 / pixelCenter) * outlineSensitivity;

  return SobelDepth(pixelCenter, pixelLeft, pixelRight, pixelUp, pixelDown) * outlineDepthMultiplier;
}


#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec3 offset = vec3((1.0 / screenSize.x), (1.0 / screenSize.y), 0.0) * outlineThickness;
  float sobelDepth = SobelSampleDepth(v_texCoord, offset);
  float sobelValue = pow(sobelDepth, outlineDepthBias);

  float minEdgeValue = 0.25;
  float maxEdgeValue = 0.55;
  sobelDepth = smoothstep(minEdgeValue, maxEdgeValue, sobelValue);

#ifdef ENABLE_ES3
  fragColor = vec4(outlineColor.rgb, sobelDepth);
#else
  fragColor = vec4(mix(texture2D(colorTexture, v_texCoord).rgb, outlineColor.rgb, sobelDepth), 1.0);
#ifdef  GL_EXT_frag_depth
  gl_FragDepthEXT = texture2D(depthTexture, v_texCoord).r;
#endif
#endif

  // float z = texture2D(depthTexture, v_texCoord).r;
  // float near = depthRange.x * 2.0;    // the near plane
  // float far = depthRange.y / 2.0;     // the far plane
  // float c = (2.0 * near) / (far + near - z * (far - near));  // convert to linear values 
  // fragColor = vec4(vec3(c), 1.0);

  

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
