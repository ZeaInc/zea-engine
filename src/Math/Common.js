const DEGTORAD = Math.PI / 180;
Math.HALF_PI = Math.PI * 0.5;
Math.TWO_PI = Math.PI * 2.0;
// Defines used to explicity specify types for WebGL.
const UInt32 = 1;
const SInt32 = 2;
const Float32 = 3;

Math.radToDeg = function(rad) {
  return rad / DEGTORAD;
};
Math.degToRad = function(deg) {
  return deg * DEGTORAD;
};

Number.isNumeric = n => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

String.prototype.replaceAll = function(search, replacement) {
  const target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

const hashStr = function(str) {
  let hash = 0;
  let i;
  let chr;
  let len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

String.prototype.hash = function() {
  return hashStr(this);
};

// trimming space from both side of the string
String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, '');
};

// trimming space from left side of the string
String.prototype.ltrim = function() {
  return this.replace(/^\s+/, '');
};

// trimming space from right side of the string
String.prototype.rtrim = function() {
  return this.replace(/\s+$/, '');
};

// pads left
String.prototype.lpad = function(padString, length) {
  let str = this;
  while (str.length < length) str = padString + str;
  return str;
};

// pads right
String.prototype.rpad = function(padString, length) {
  let str = this;
  while (str.length < length) str = str + padString;
  return str;
};

function JSON_stringify_fixedPrecision(val, space = 0, precision = 5) {
  return JSON.stringify(
    val,
    function(key, val) {
      return val ? (val.toFixed ? Number(val.toFixed(precision)) : val) : val;
    },
    space
  );
}

Math.randomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

Math.lerp = (a, b, t) => {
  return a + t * (b - a);
};

Math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

Math.nearestPow2 = function(value) {
  return Math.pow(2, Math.round(Math.log(value) / Math.log(2)));
};

Math.nearestPow10 = function(value) {
  return Math.pow(10, Math.round(Math.log10(value) / Math.log10(10)));
};

Math.nextPow2 = function(value) {
  let exp = 0;
  while (value > 0) {
    exp++;
    value = value >> 1;
  }
  return 1 << exp;
};
Math.fract = function(value) {
  if (value == 0) return 0;
  if (value < 0) {
    if (value > -1.0) return -value;
    return -value % Math.floor(-value);
  }
  if (value < 1.0) return value;
  return value % Math.floor(value);
};

Math.remap = function(value, start1, end1, start2, end2) {
  return start2 + (end2 - start2) * ((value - start1) / (end1 - start1));
};

// https://stackoverflow.com/questions/32633585/how-do-you-convert-to-half-floats-in-javascript
/* This method is faster than the OpenEXR implementation (very often
 * used, eg. in Ogre), with the additional benefit of rounding, inspired
 * by James Tursa?s half-precision code. */
Math.convertFloat32ArrayToUInt16Array = function(float32Array) {
  const unit16s = new Uint16Array(float32Array.length);
  const int32View = new Int32Array(float32Array.buffer);
  const toUInt16 = x => {
    let bits = (x >> 16) & 0x8000; /* Get the sign */
    let m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
    const e = (x >> 23) & 0xff; /* Using int is faster here */

    /* If zero, or denormal, or exponent underflows too much for a denormal
     * half, return signed zero. */
    if (e < 103) {
      return bits;
    }

    /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
    if (e > 142) {
      bits |= 0x7c00;
      /* If exponent was 0xff and one mantissa bit was set, it means NaN,
       * not Inf, so make sure we set one mantissa bit too. */
      bits |= (e == 255 ? 0 : 1) && x & 0x007fffff;
      return bits;
    }

    /* If exponent underflows but not too much, return a denormal */
    if (e < 113) {
      m |= 0x0800;
      /* Extra rounding may overflow and set mantissa to 0 and exponent
       * to 1, which is OK. */
      bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
      return bits;
    }

    bits |= ((e - 112) << 10) | (m >> 1);
    /* Extra rounding. An overflow will set mantissa to 0 and increment
     * the exponent, which is OK. */
    bits += m & 1;

    return bits;
  };
  for (let i = 0; i < float32Array.length; i++) {
    unit16s[i] = toUInt16(int32View[i]);
  }
  return unit16s;
};

// ///////////////////////////////////////////////
// https://gist.github.com/Flexi23/1713774
// Note: assuemd inputs are a pair of bytes, likely generated in GLSL.
// Code converted to using bit masks in JavaScript.
Math.decode16BitFloatFrom2xUInt8 = c => {
  const ix = c[0]; // 1st byte: 1 bit signum, 4 bits exponent, 3 bits mantissa (MSB)
  const iy = c[1]; // 2nd byte: 8 bit mantissa (LSB)

  const s = ix & 0x80 ? 1 : -1; // get bit 8
  const iexp = (ix & 0x78) >> 3; // mask bits 7-4
  const msb = ix & 0x7; // mask bits 3-1

  let norm = iexp == 0 ? 0 : 2048; // distinguish between normalized and subnormalized numbers
  const mantissa = norm + (msb << 8) + iy; // implicite preceding 1 or 0 added here
  norm = iexp == 0 ? 1 : 0; // normalization toggle
  const exponent = Math.pow(2, iexp + norm - 16); // -5 for the the exponent bias from 2^-5 to 2^10 plus another -11 for the normalized 12 bit mantissa
  const v = s * mantissa * exponent;

  return v;
};

Math.encode16BitFloatInto2xUInt8 = v => {
  if (!c) c = new Uint8Array(2);
  // const c = [0, 0];
  const signum = v >= 0 ? 128 : 0;
  v = Math.abs(v);
  let exponent = 15;
  let limit = 1024; // considering the bias from 2^-5 to 2^10 (==1024)
  for (let exp = 15; exp > 0; exp--) {
    if (v < limit) {
      limit /= 2;
      exponent--;
    }
  }

  let rest;
  if (exponent == 0) {
    rest = v / limit / 2; // "subnormalize" implicite preceding 0.
  } else {
    rest = (v - limit) / limit; // normalize accordingly to implicite preceding 1.
  }

  const mantissa = Math.round(rest * 2048); // 2048 = 2^11 for the (split) 11 bit mantissa
  const msb = mantissa / 256; // the most significant 3 bits go into the lower part of the first byte
  const lsb = mantissa - msb * 256; // there go the other 8 bit of the lower significance

  c[0] = signum + exponent * 8 + msb; // color normalization for texture2D
  c[1] = lsb;

  if (v >= 2048) {
    c[0] = 255;
  }

  return c;
};

Math.encode16BitFloat = v => {
  const float32Array = new Float32Array(1);
  float32Array[0] = v;
  const unit16s = new Uint16Array(float32Array.length);
  const int32View = new Int32Array(float32Array.buffer);

  const toUInt16 = x => {
    let bits = (x >> 16) & 0x8000; /* Get the sign */
    let m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
    const e = (x >> 23) & 0xff; /* Using int is faster here */

    /* If zero, or denormal, or exponent underflows too much for a denormal
     * half, return signed zero. */
    if (e < 103) {
      return bits;
    }

    /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
    if (e > 142) {
      bits |= 0x7c00;
      /* If exponent was 0xff and one mantissa bit was set, it means NaN,
       * not Inf, so make sure we set one mantissa bit too. */
      bits |= (e == 255 ? 0 : 1) && x & 0x007fffff;
      return bits;
    }

    /* If exponent underflows but not too much, return a denormal */
    if (e < 113) {
      m |= 0x0800;
      /* Extra rounding may overflow and set mantissa to 0 and exponent
       * to 1, which is OK. */
      bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
      return bits;
    }

    bits |= ((e - 112) << 10) | (m >> 1);
    /* Extra rounding. An overflow will set mantissa to 0 and increment
     * the exponent, which is OK. */
    bits += m & 1;

    return bits;
  };

  return toUInt16(int32View[0]);
};

// https://stackoverflow.com/questions/5678432/decompressing-half-precision-floats-in-javascript
// Note: faster version available, but might not matter.
Math.decode16BitFloat = h => {
  const s = (h & 0x8000) >> 15;
  const e = (h & 0x7c00) >> 10;
  const f = h & 0x03ff;

  if (e == 0) {
    return (s ? -1 : 1) * Math.pow(2, -14) * (f / Math.pow(2, 10));
  } else if (e == 0x1f) {
    return f ? NaN : (s ? -1 : 1) * Infinity;
  }

  return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / Math.pow(2, 10));
};

Math.smoothStep = (edge0, edge1, x) => {
  const t = Math.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
};

Math.linStep = (edge0, edge1, x) => {
  return Math.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
};

export { SInt32, UInt32, Float32, hashStr, JSON_stringify_fixedPrecision };
