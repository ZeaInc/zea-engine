
  uniform vec3 shCoeffs[9];
  
  vec3 sampleSHCoeffs(vec3 dir) {
    // dir is assumed to have unit length
    float x = dir.x, y = dir.y, z = dir.z;
    // band 0
    vec3 result = shCoeffs[ 0 ] * 0.886227;
    // band 1
    result += shCoeffs[ 1 ] * 2.0 * 0.511664 * y;
    result += shCoeffs[ 2 ] * 2.0 * 0.511664 * z;
    result += shCoeffs[ 3 ] * 2.0 * 0.511664 * x;
    // band 2
    result += shCoeffs[ 4 ] * 2.0 * 0.429043 * x * y;
    result += shCoeffs[ 5 ] * 2.0 * 0.429043 * y * z;
    result += shCoeffs[ 6 ] * ( 0.743125 * z * z - 0.247708 );
    result += shCoeffs[ 7 ] * 2.0 * 0.429043 * x * z;
    result += shCoeffs[ 8 ] * 0.429043 * ( x * x - y * y );
    return result;
  }
