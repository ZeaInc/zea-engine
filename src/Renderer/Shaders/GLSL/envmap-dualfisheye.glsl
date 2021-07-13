


vec2 dualfisheyeUVsFromDir(vec3 dir) {
  vec2 result;
  float angle = 0.465;
    if(dir.x < 0.0) {
        result = vec2(((dir.z * -angle) + 0.5) * 0.5, (dir.y * angle) + 0.5);
    }
    else {
        result = vec2( 0.5 + ((dir.z * angle) + 0.5) * 0.5, (dir.y * angle) + 0.5);
    }
    return result;
}


