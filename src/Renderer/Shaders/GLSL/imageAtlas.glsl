
// Note: On mobile, I can't seem to pass around a stuct containing sampler2D.
// I have to unpack the struct and pass its members. :(
// struct ImageAtlas {
//     sampler2D layout;
//     sampler2D image;
//     vec4 desc;
// };



vec4 getSubImageLayout(int index, in sampler2D atlasLayout, in vec4 atlasDesc){
    return fetchTexel(atlasLayout, int(floor(atlasDesc.z+0.5)), index);
}

vec2 calcSubImageTexCoords(vec2 texCoord, int index, in sampler2D atlasLayout, in vec4 atlasDesc){
    vec4 layoutData = fetchTexel(atlasLayout, int(floor(atlasDesc.z+0.5)), index);
    // The following line is a hack to fix artifacts in our PBR lighting
    // We were seeing loads of lighting garbage on some sufaces that were orthogonal
    // to the world. The UV coordinates would have been landing right on the edges
    // of our subimages and were often sampling outside the image. This couuld
    // have been because of filtering, or an error in the uv coords. 
    texCoord = clamp(texCoord, vec2(0.01, 0.01), vec2(0.99, 0.99));
    vec2 subimageTexel = texCoord * layoutData.zw;
    // subimageTexel = clamp(subimageTexel, vec2(0.0, 0.0), vec2(1.0, 1.0));
    return subimageTexel + layoutData.xy;
}

vec4 sampleSubImage(vec2 texCoord, int index, in sampler2D atlasLayout, in sampler2D atlasImage, in vec4 atlasDesc){
    vec4 layoutData = fetchTexel(atlasLayout, int(floor(atlasDesc.z+0.5)), index);
    vec2 atlasCoords = calcSubImageTexCoords(texCoord, index, atlasLayout, atlasDesc);
    return texture2D(atlasImage, atlasCoords);
}

