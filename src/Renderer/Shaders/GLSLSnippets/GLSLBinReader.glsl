
#ifdef DECODE_16BIT_FLOAT_FROM_8BIT_INT

/////////////////////////////////////////////////////////////////
// http://concord-consortium.github.io/lab/experiments/webgl-gpgpu/script.js
// Note: modulo on some GPUS. (e.g. iPhone)
// often incur errors in modulo, leaving a result
// that appears to boe the y param. in this use case
// we are only interested in integer moduos anyway
// so we just trim off erronious values. .Seems to work. 
float fixed_mod(float x, float y) {
  float res = mod(x, y);
  return (abs(y - res) < 0.5) ? 0.0 : res;
}

float shift_right(float v, float amt) {
  v = floor(v) + 0.5;
  return floor(v / exp2(amt));
}

float shift_left(float v, float amt) {
  return floor(v * exp2(amt) + 0.5);
}

float mask_last(float v, float bits) {
  return fixed_mod(v, shift_left(1.0, bits));
}

float extract_bits(float num, float from, float to) {
  from = floor(from + 0.5);
  to = floor(to + 0.5);
  return mask_last(shift_right(num, from), to - from);
}


/////////////////////////////////////////////////////////////////

float decode16BitFloatFrom2xUInt8_IEEE(vec2 c){
  float v = 0.;

  // int h = c.x + c.y * 256;
  // const s = (h & 0x8000) >> 15;
  // const e = (h & 0x7C00) >> 10;
  // const f = h & 0x03FF;


  // float h = c.x + c.y * 256.0;
  // float s = extract_bits(h, 15.0, 16.0);
  // float e = extract_bits(h, 10.0, 15.0);
  // float f = extract_bits(h, 0.0, 10.0);

  // float s = extract_bits(c.y, 7.0, 8.0);
  // float e = extract_bits(c.y, 2.0, 7.0);

  int s = (c.y >= 127.5) ? 1 : 0;
  float e = shift_right(c.y - ((s == 1) ? 128.0 : 0.0), 2.0);
  float f = c.x + mask_last(c.y, 2.0) * 256.0;
  // return float(s);

  if(e < 0.5) {
    return ((s!=0)?-1.0:1.0) * exp2(-14.0) * (f/exp2(10.0));
  } else if (int(e) == 0x1F) {
    float NaN = 0.0;
    float Inf = 0.0;
    return (f==0.0)?(NaN):(((s!=0)?-1.0:1.0)*Inf);
  }

  return ((s!=0)?-1.0:1.0) * exp2(e-15.0) * (1.0+(f/exp2(10.0)));
}

#endif

// RGBA16 textures
vec4 GLSLBinReader_texelFetch2D(sampler2D texture, ivec2 textureSize, ivec2 address) {
  return fetchTexel(texture, textureSize, address);
}

struct GLSLBinReader {
  ivec2 textureSize; 
  ivec4 region;
  ivec2 start; /* the base address from which we base the offsets */
  int offset; /* how far we have read into the buffer . Note: value is in channels. so 4 == 1 pixel.*/
  vec4 buffer; 
  ivec2 bufferaddress;
  int bpc; // bits per channel. (e.g. 8, 16, 32)
};

void GLSLBinReader_init(inout GLSLBinReader reader, ivec2 textureSize, ivec4 region, ivec2 start, int bpc) {
  reader.textureSize = textureSize;
  reader.region = region;
  reader.start = start;
#ifdef DECODE_16BIT_FLOAT_FROM_8BIT_INT
  reader.start = ivec2(start.x * 2, start.y);
#else
  reader.start = start;
#endif
  reader.bpc = bpc;
  reader.bufferaddress = ivec2(-1, -1);
}

void GLSLBinReader_init(inout GLSLBinReader reader, ivec2 textureSize, int bpc) {
  reader.textureSize = textureSize;
  reader.region = ivec4(0, 0, textureSize.x, textureSize.y);
  reader.start = ivec2(0,0);
  reader.bpc = bpc;
  reader.bufferaddress = ivec2(-1, -1);
}


ivec2 GLSLBinReader_getAddress(in GLSLBinReader reader, int offset) {
#ifdef DECODE_16BIT_FLOAT_FROM_8BIT_INT
  ivec2 address = ivec2(reader.start.x + (offset/2), reader.start.y);
#else
  ivec2 address = ivec2(reader.start.x + (offset/4), reader.start.y);
#endif
  address.y += address.x / reader.region.z;
  address.x = imod(address.x, reader.region.z);
  return address;
}


float GLSLBinReader_readFloat(inout GLSLBinReader reader, sampler2D texture, int offset) {

  ivec2 address = GLSLBinReader_getAddress(reader, offset);

  if(address != reader.bufferaddress){
    reader.buffer = GLSLBinReader_texelFetch2D(texture, reader.textureSize, reader.region.xy + address);
    reader.bufferaddress = address;
  }

#ifdef DECODE_16BIT_FLOAT_FROM_8BIT_INT

  int swizelIndex = imod(offset, 2);
  if(swizelIndex == 0)
    return decode16BitFloatFrom2xUInt8_IEEE(reader.buffer.xy * 255.0);
  return decode16BitFloatFrom2xUInt8_IEEE(reader.buffer.zw * 255.0);

#else

  int swizelIndex = imod(offset, 4);
  if(swizelIndex == 0)
    return reader.buffer.x;
  if(swizelIndex == 1)
    return reader.buffer.y;
  if(swizelIndex == 2)
    return reader.buffer.z;
  return reader.buffer.w;
  
#endif
}


int GLSLBinReader_readInt(inout GLSLBinReader reader, sampler2D texture, int offset) {
  if(reader.bpc == 8)
    return int(GLSLBinReader_readFloat(reader, texture, offset) * 255.0);
  else {
    float flt = GLSLBinReader_readFloat(reader, texture, offset);
    return int(flt);
  }
}

int GLSLBinReader_readUInt(inout GLSLBinReader reader, sampler2D texture, int offset) {
  if(reader.bpc == 8)
    return int(GLSLBinReader_readFloat(reader, texture, offset) * 255.0);
  else {
    float flt = GLSLBinReader_readFloat(reader, texture, offset);
    if (flt < 0.0) {
      return int(2048.0 - flt);
    }
    else {
      return int(flt);
    }
  }
}

vec4 GLSLBinReader_readVec4(inout GLSLBinReader reader, sampler2D texture, int offset) {
  ivec2 address = GLSLBinReader_getAddress(reader, offset);
  return GLSLBinReader_texelFetch2D(texture, reader.textureSize, reader.region.xy + address);
}


vec3 GLSLBinReader_readVec3(inout GLSLBinReader reader, sampler2D texture, int offset) {
  return GLSLBinReader_readVec4(reader, texture, offset).rgb;
}

vec2 GLSLBinReader_readVec2(inout GLSLBinReader reader, sampler2D texture, int offset) {
  return vec2(
    GLSLBinReader_readFloat(reader, texture, offset),
    GLSLBinReader_readFloat(reader, texture, offset+1)
  );
}



float GLSLBinReader_readFloat(inout GLSLBinReader reader, sampler2D texture) {
  float result = GLSLBinReader_readFloat( reader,  texture, reader.offset);
  reader.offset++;
  return result;
}

int GLSLBinReader_readInt(inout GLSLBinReader reader, sampler2D texture) {
  if(reader.bpc == 8)
    return int(GLSLBinReader_readFloat(reader, texture) * 255.0);
  else
    return int(GLSLBinReader_readFloat(reader, texture));
}

int GLSLBinReader_readUInt(inout GLSLBinReader reader, sampler2D texture) {
  if(reader.bpc == 8)
    return int(GLSLBinReader_readFloat(reader, texture) * 255.0);
  else {
    float flt = GLSLBinReader_readFloat(reader, texture);
    if (flt < 0.0) {
      return int(2048.0 - flt);
    }
    else {
      return int(flt);
    }
  }
}

int GLSLBinReader_readUIntFrom2xUFloat16(inout GLSLBinReader reader, sampler2D texture) {
  int partA = GLSLBinReader_readUInt(reader, texture);
  int partB = GLSLBinReader_readUInt(reader, texture);
  
#ifdef INTS_PACKED_AS_2FLOAT16
  // Changed on version 0.0.28
  return partA + (partB * 4096);
#else
  return partA + (partB * 256);
#endif
}

vec4 GLSLBinReader_readVec4(inout GLSLBinReader reader, sampler2D texture) {
  vec4 result = GLSLBinReader_readVec4( reader, texture, reader.offset);
  reader.offset += 4;
  return result;
}


vec3 GLSLBinReader_readVec3(inout GLSLBinReader reader, sampler2D texture) {
  return GLSLBinReader_readVec4(reader, texture).rgb;
}

vec2 GLSLBinReader_readVec2(inout GLSLBinReader reader, sampler2D texture) {
  return vec2(
    GLSLBinReader_readFloat(reader, texture),
    GLSLBinReader_readFloat(reader, texture)
  );
}



