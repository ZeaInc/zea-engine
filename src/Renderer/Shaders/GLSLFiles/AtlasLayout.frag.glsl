
precision highp float;

uniform sampler2D srctexture;
uniform vec2 srctextureDim;
uniform bool alphaFromLuminance;
uniform bool invert;

/* VS Outputs */
varying vec2 v_texCoord;

float luminanceFromRGB(vec3 rgb) {
  return 0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b;
}


#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
  vec2 pixelCoord = v_texCoord*srctextureDim;
  vec2 uv = v_texCoord;

  // Wrap X coords
  if(pixelCoord.x < 0.0){
    uv.x += 1.0/srctextureDim.x;
    uv.y = 1.0 - uv.y;
  }
  else if(pixelCoord.x > srctextureDim.x){
    uv.x -= 1.0/srctextureDim.x;
    uv.y = 1.0 - uv.y;
  }

  // Wrap Y coords
  if(pixelCoord.y < 0.0){
    uv.y += 1.0/srctextureDim.y;
    uv.x = 1.0 - uv.x;
  }
  else if(pixelCoord.y > srctextureDim.y){
    uv.y -= 1.0/srctextureDim.y;
    uv.x = 1.0 - uv.x;
  }

  vec4 texel = texture2D(srctexture, uv);

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  // TODO: check why we pre-multiply alphas here.
  // fragColor = vec4(texel.rgb/texel.a, texel.a);

  if(alphaFromLuminance) {
    fragColor = vec4(texel.rgb, luminanceFromRGB(texel.rgb));
  }
  else {
    fragColor = texel;
  }
  
  if(invert) {
    fragColor = vec4(1.0) - fragColor;
  }

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}

