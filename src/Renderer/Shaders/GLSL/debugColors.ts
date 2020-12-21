import { shaderLibrary } from '../../ShaderLibrary.js'

shaderLibrary.setShaderModule(
  'debugColors.glsl',
  `

float modI(float a, float b) {
    float m=a-floor((a+0.5)/b)*b;
    return floor(m+0.5);
}

vec3 getDebugColor(float id) {
#ifdef GLSL_ES3
    const vec3 clusterColors[4] = vec3[4]( vec3(0.0, 0.25, 0.25), vec3(0.0, 0.85, 0.25), vec3(0.0, 0.25, 0.85), vec3(0.0, 0.85, 0.85) );
#else
    vec3 clusterColors[8];
    clusterColors[0] = vec3(0.0, 0.15, 0.15);
    clusterColors[1] = vec3(0.0, 0.85, 0.15);
    clusterColors[2] = vec3(0.0, 0.15, 0.85);
    clusterColors[3] = vec3(0.0, 0.85, 0.85);
    clusterColors[4] = vec3(0.75, 0.15, 0.15);
    clusterColors[5] = vec3(0.75, 0.85, 0.15);
    clusterColors[6] = vec3(0.75, 0.15, 0.85);
    clusterColors[7] = vec3(0.75, 0.85, 0.85);
#endif

    if(modI(id, 8.0) == 0.0)
        return clusterColors[0];
    else if(modI(id, 8.0) == 1.0)
        return clusterColors[1];
    else if(modI(id, 8.0) == 2.0)
        return clusterColors[2];
    else if(modI(id, 8.0) == 3.0)
        return clusterColors[3];
    else if(modI(id, 8.0) == 4.0)
        return clusterColors[4];
    else if(modI(id, 8.0) == 5.0)
        return clusterColors[5];
    else if(modI(id, 8.0) == 6.0)
        return clusterColors[6];
    else if(modI(id, 8.0) == 7.0)
        return clusterColors[7];

    return vec3(1,0,0);
}


`
)
