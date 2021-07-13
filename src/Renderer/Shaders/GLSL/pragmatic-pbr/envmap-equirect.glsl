 


vec2 latLongUVsFromDir(vec3 dir) {
  // Math function taken from...
  // http://gl.ict.usc.edu/Data/HighResProbes/
  // Note: Scaling from u=[0,2], v=[0,1] to u=[0,1], v=[0,1]
  float phi = acos(dir.z);
  float theta = atan(dir.x, dir.y);
  return vec2((1.0 + theta / PI) / 2.0, phi / PI);
}

// Note: when u == 0.5 z = 1.0
vec3 dirFromLatLongUVs(float u, float v) {
    // http://gl.ict.usc.edu/Data/HighResProbes/
    float theta = PI*((u * 2.0) - 1.0);
    float phi = PI*v;
    return vec3(sin(phi)*sin(theta), sin(phi)*cos(theta), cos(phi));
}

vec3 dirFromPolar(vec2 polar) {
    float u = polar.x / (PI * 2.0);
    float v = polar.y / PI;
    return dirFromLatLongUVs(u, v);
}

