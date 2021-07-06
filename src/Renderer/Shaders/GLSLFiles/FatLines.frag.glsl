
precision highp float;

/* VS Outputs */
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
varying vec2 v_texCoord;

uniform color BaseColor;
uniform mat4 cameraMatrix;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  int debugLevel = 0;
  if(debugLevel == 0){

    vec3 viewVector = mat3(cameraMatrix) * normalize(-v_viewPos);
    vec3 normal = mat3(cameraMatrix) * v_viewNormal;
    float NdotV = dot(normalize(normal), normalize(viewVector));

    // Modulate the lighting using the texture coord so the line looks round.
    NdotV *= cos((v_texCoord.x - 0.5) * 2.0);

    vec4 color = BaseColor * NdotV;
    fragColor = vec4(color.rgb, BaseColor.a);
  }
  else{
    fragColor = vec4(v_texCoord.x, 0.0, 0.0, 1.0);
  }

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
