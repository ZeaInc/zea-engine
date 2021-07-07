
    
/////////////////////////////////////////////////////////////////
// http://concord-consortium.github.io/lab/experiments/webgl-gpgpu/script.js
float shift_right(float v, float amt) {
  v = floor(v) + 0.5;
  return floor(v / exp2(amt));
}
float shift_left(float v, float amt) {
  return floor(v * exp2(amt) + 0.5);
}

float mask_last(float v, float bits) {
  return mod(v, shift_left(1.0, bits));
}
float extract_bits(float num, float from, float to) {
  from = floor(from + 0.5);
  to = floor(to + 0.5);
  return mask_last(shift_right(num, from), to - from);
}

/////////////////////////////////////////////////////////////////
// https://stackoverflow.com/questions/18453302/how-do-you-pack-one-32bit-int-into-4-8bit-ints-in-glsl-webgl

const vec4 bitEnc = vec4(1.,255.,65025.,16581375.);
const vec4 bitDec = 1./bitEnc;
vec4 EncodeFloatRGBA (float v) {
    vec4 enc = bitEnc * v;
    enc = fract(enc);
    enc -= enc.yzww * vec2(1./255., 0.).xxxy;
    return enc;
}
float DecodeFloatRGBA (vec4 v) {
    return dot(v, bitDec);
}



/////////////////////////////////////////////////////////////////
// https://gist.github.com/Flexi23/1713774
// 
vec2 encode16BitFloatInto2xUInt8(float v){
    vec2 c = vec2(0.);

    int signum = (v >= 0.) ? 128 : 0;
    v = abs(v);
    int exponent = 15;
    float limit = 1024.; // considering the bias from 2^-5 to 2^10 (==1024)
    for(int exp = 15; exp > 0; exp--){
        if( v < limit){
            limit /= 2.;
            exponent--;
        }
    }

    float rest;
    if(exponent == 0){
        rest = v / limit / 2.;      // "subnormalize" implicite preceding 0. 
    }else{
        rest = (v - limit)/limit;   // normalize accordingly to implicite preceding 1.
    }

    int mantissa = int(rest * 2048.);   // 2048 = 2^11 for the (split) 11 bit mantissa
    int msb = mantissa / 256;           // the most significant 3 bits go into the lower part of the first byte
    int lsb = mantissa - msb * 256;     // there go the other 8 bit of the lower significance

    c.x = float(signum + exponent * 8 + msb) / 255.;    // color normalization for texture2D
    c.y = float(lsb) / 255.;

    if(v >= 2048.){
        c.y = 1.;
    }

    return c;
}

float decode16BitFloatFrom2xUInt8(vec2 c){
    float v = 0.;

    int ix = int(c.x*255.); // 1st byte: 1 bit signum, 4 bits exponent, 3 bits mantissa (MSB)
    int iy = int(c.y*255.); // 2nd byte: 8 bit mantissa (LSB)

    int s = (c.x >= 0.5) ? 1 : -1;
    ix = (s > 0) ? ix - 128 : ix;   // remove the signum bit from exponent
    int iexp = ix / 8;              // cut off the last 3 bits of the mantissa to select the 4 exponent bits
    int msb = ix - iexp * 8;        // subtract the exponent bits to select the 3 most significant bits of the mantissa

    int norm = (iexp == 0) ? 0 : 2048;          // distinguish between normalized and subnormalized numbers
    int mantissa = norm + msb * 256 + iy;       // implicite preceding 1 or 0 added here
    norm = (iexp == 0) ? 1 : 0;                 // normalization toggle
    float exponent = pow( 2., float(iexp + norm) - 16.); // -5 for the the exponent bias from 2^-5 to 2^10 plus another -11 for the normalized 12 bit mantissa 
    v = float( s * mantissa ) * exponent;

    return v;
}


// TODO : Encoding Float32 to 4x UInt8
// http://concord-consortium.github.io/lab/experiments/webgl-gpgpu/script.js
// http://ultraist.hatenablog.com/entry/20110608/1307539319

