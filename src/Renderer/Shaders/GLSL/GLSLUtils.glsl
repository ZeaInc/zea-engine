


int ftoi(float val){
    return int(floor(val + 0.5));
}
ivec2 ftoi(vec2 v2) {
    return ivec2(ftoi(v2.x), ftoi(v2.y));
}
ivec3 ftoi(vec3 v4) {
    return ivec3(ftoi(v4.x), ftoi(v4.y), ftoi(v4.z));
}
ivec4 ftoi(vec4 v4) {
    return ivec4(ftoi(v4.x), ftoi(v4.y), ftoi(v4.z), ftoi(v4.w));
}

#ifdef ENABLE_ES3

int imod(int x, int y) {
    return x % y;
}

void setFlag(inout int flags, int flag) {
    flags |= flag;
}

void clearFlag(inout int flags, int flag) {
    flags &= ~flag;
}

bool testFlag(int flags, int flag) {
    return (flags & flag) != 0;
}

// private function: Mangle me...
ivec2 _pixelIndexToUV(int index, int textureWidth){
    return ivec2(index % textureWidth, index / textureWidth);
}

vec4 fetchTexel(sampler2D texture, int textureWidth, int index) {
    return texelFetch(texture, _pixelIndexToUV(index, textureWidth), 0);
}

vec4 fetchTexel(sampler2D texture, ivec2 textureSize, ivec2 texCoord) {
    return texelFetch(texture, texCoord, 0);
}

vec4 fetchTexel(sampler2D texture, ivec2 textureSize, int index) {
    return texelFetch(texture, _pixelIndexToUV(index, textureSize.x), 0);
}

#else

// TODO: integrate: https://gist.github.com/mattatz/70b96f8c57d4ba1ad2cd

int max(int a, int b) {
    return a > b ? a : b;
}
int min(int a, int b) {
    return a < b ? a : b;
}


float round(float val){
    return floor(val + 0.4);
}

int imod(int x, int y) {
    return x-y*(x/y);
}

void setFlag(inout int flags, int flag) {
    flags += flag;
}
void clearFlag(inout int flags, int flag) {
    flags -= flag;
}

bool testFlag(int flags, int flag) {
    return imod(flags / flag, 2) != 0;
}

// private function: Mangle me...
vec2 _pixelIndexToUV(int index, int textureSize){
    float flTexSize = float(textureSize);
    float x = (float(imod(index, textureSize))+0.5)/flTexSize;
    float y = (floor(float(index / textureSize))+0.5)/flTexSize;
    return vec2(x, y);
}

vec4 fetchTexel(sampler2D texture, int textureSize, int index) {
    vec2 texCoord = _pixelIndexToUV(index, textureSize);
    return texture2D(texture, texCoord);
}

vec4 fetchTexel(sampler2D texture, ivec2 textureSize, ivec2 texCoord) {
    vec2 ftextureSize = vec2(textureSize);
    return texture2D(texture, (vec2(texCoord) + 0.5) / ftextureSize);
}


#endif // ENABLE_ES3

int uvToPixelIndex(vec2 uv, int textureSize){
    return int(uv.x * float(textureSize)) + (int(floor(uv.y * float(textureSize))) * textureSize);
}

