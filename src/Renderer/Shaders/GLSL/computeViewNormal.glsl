
  
#ifdef ENABLE_ES3
vec3 computeViewNormal(vec3 viewPos) {
  vec3 fdx = dFdx(viewPos);
  vec3 fdy = dFdy(viewPos);
  return normalize(cross(fdx, fdy));
}
#else 
vec3 computeViewNormal(vec3 viewPos) {
  return vec3(0.0, 0.0, 0.0);
}
#endif
