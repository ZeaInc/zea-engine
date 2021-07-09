
#ifdef ENABLE_FLOAT_TEXTURES

uniform sampler2D instancesTexture;
uniform highp int instancesTextureSize;

const int pixelsPerItem = 6;

vec4 getInstanceData(int id) {
    return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 0);
}

#else

uniform vec4 drawItemData;

vec4 getInstanceData(int id) {
    return drawItemData;
}

#endif


