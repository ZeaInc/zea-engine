
  import 'Hammersley.glsl'
  
  
  #ifdef ENVMAP_CUBE
  
  uniform samplerCube envMap;
  
  vec4 sampleEnvMap(vec3 dir) {
    return texture(envMap, dir);
  }
  
  #else 
  
  uniform sampler2D   envMap;
  
  import 'envmap-octahedral.glsl'
  
  vec4 sampleEnvMap(vec3 dir) {
    vec2 uv = dirToSphOctUv(dir);
    vec4 texel = texture2D(envMap, vec2(uv.x, 1.0 - uv.y));
    return vec4(texel.rgb/texel.a, 1.0); // TODO: Check this line. Do we need it?
  }
  
  #endif 
  
  
  vec3 cubeFaceUvToDir(float u, float v, int faceId) {
  
    // normalize into [-1, 1] range
    float n_u = 2.0 * u - 1.0;
    float n_v = 2.0 * v - 1.0;
  
    vec3 dir;
    switch (faceId)
    {
    case 0: //TEXTURE_CUBE_MAP_POSITIVE_X:
      dir.x = 1.0f;
      dir.y = n_v;
      dir.z = -n_u;
      break;
    case 1: //TEXTURE_CUBE_MAP_NEGATIVE_X:
      dir.x = -1.0f;
      dir.y = n_v;
      dir.z = n_u;
      break;
    case 3: //TEXTURE_CUBE_MAP_POSITIVE_Y:
      dir.x = n_u;
      dir.y = 1.0f;
      dir.z = -n_v;
      break;
    case 2: //TEXTURE_CUBE_MAP_NEGATIVE_Y:
      dir.x = n_u;
      dir.y = -1.0f;
      dir.z = n_v;
      break;
    case 4: //TEXTURE_CUBE_MAP_POSITIVE_Z:
      dir.x = n_u;
      dir.y = n_v;
      dir.z = 1.0f;
      break;
    case 5: //TEXTURE_CUBE_MAP_NEGATIVE_Z:
      dir.x = -n_u;
      dir.y = n_v;
      dir.z = -1.0f;
      break;
    }
    return normalize(dir);
  }
  

