
// Stream Desc looks like the following
// x : atlas Width in images
// y : atlas height in images
// z : image Width
// w : image Height

vec2 calcFrameImageTexCoords(vec2 texCoord, int index, in vec4 streamDesc){
	float index_x = floor(mod(float(index), streamDesc.x));
	float index_y = floor(float(index) / streamDesc.x);
    return vec2( 
    	(index_x + texCoord.x) / streamDesc.x, 
    	(index_y + texCoord.y) / streamDesc.y
    	);
}

vec4 sampleStreamFrame(vec2 texCoord, int index, in sampler2D streamImage, in vec4 streamDesc){
    return texture2D(streamImage, calcFrameImageTexCoords(texCoord, index, streamDesc));
}

