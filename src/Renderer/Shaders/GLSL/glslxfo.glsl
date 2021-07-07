
import 'GLSLUtils.glsl'

struct Xfo {
    vec3 tr;
    vec4 ori;
    float sc;
};

Xfo getXfo(sampler2D texture, int textureSize, int index) {
    const int cols_per_instance = 2;
    Xfo xfo;
    vec4 col0 = fetchTexel(texture, textureSize, (index * cols_per_instance));
    vec4 col1 = fetchTexel(texture, textureSize, (index * cols_per_instance) + 1);
    xfo.tr = col0.rgb;
    xfo.ori = col1;
    xfo.sc = col0.a;
    return xfo;
}


vec4 quat_conjugate(vec4 quat) {
    return vec4(-quat.x, -quat.y, -quat.z, quat.w);
}


vec4 quat_multiply(vec4 lhs, vec4 rhs) {
    float ax = lhs.x;
    float ay = lhs.y;
    float az = lhs.z;
    float aw = lhs.w;
    float bx = rhs.x;
    float by = rhs.y;
    float bz = rhs.z;
    float bw = rhs.w;
    return vec4(
        ax * bw + aw * bx + ay * bz - az * by,
        ay * bw + aw * by + az * bx - ax * bz,
        az * bw + aw * bz + ax * by - ay * bx,
        aw * bw - ax * bx - ay * by - az * bz
    );
}

vec3 quat_rotateVec3(vec4 quat, vec3 rhs) {
    vec4 vq = vec4(rhs.x, rhs.y, rhs.z, 0.0);
    vec4 pq = quat_multiply(quat_multiply(quat, vq), quat_conjugate(quat));
    return vec3(pq.x, pq.y, pq.z);
}


