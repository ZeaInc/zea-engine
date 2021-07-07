

#define sectorize(value) step(0.0, (value))*2.0-1.0
#define sum(value) dot(clamp((value), 1.0, 1.0), (value))


vec2 dirToSphOctUv(vec3 normal){
    normal = normalize(normal);
    vec3 aNorm = abs(normal);
    vec3 sNorm = sectorize(normal);
    
    vec2 dir = aNorm.xy;
    float orient = atan(dir.x, max(dir.y,0.0000000000000001))/HalfPI;

    dir = vec2(aNorm.z, length(aNorm.xy));
    float pitch = atan(dir.y, dir.x)/HalfPI;

    vec2 uv = vec2(sNorm.x*orient, sNorm.y*(1.0-orient))*pitch;

    if(normal.z < 0.0){
        uv = sNorm.xy - abs(uv.ts)*sNorm.xy;
    }
    vec2 res = uv*0.5+0.5;
    // Flip-v
    // return res;
    return vec2(res.x, 1.0 - res.y);
}


vec3 sphOctUvToDir(vec2 uv){
    uv = uv*2.0-1.0;
    // Flip-v
    uv.y = -uv.y;
    vec2 suv = sectorize(uv);
    float sabsuv =  sum(abs(uv));
    float pitch = sabsuv*HalfPI;

    if (pitch <= 0.0) {
        return vec3(0.0, 0.0, 1.0);
    }
    if (abs(pitch - PI) < 0.000001) {
        return vec3(0.0, 0.0, -1.0);
    }
    if(sabsuv > 1.0){
        uv = (1.0-abs(uv.ts))*suv;
    }

    float orient = (abs(uv.s)/sabsuv)*HalfPI;
    float sOrient = sin(orient);
    float cOrient = cos(orient);
    float sPitch = sin(pitch);
    float cPitch = cos(pitch);

    return vec3(
        sOrient*suv.s*sPitch,
        cOrient*suv.t*sPitch,
        cPitch
    );
}

