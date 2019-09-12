import { AttrValue } from './AttrValue.js';
import { typeRegistry } from './TypeRegistry.js';

class Color extends AttrValue {
  constructor(r = 0, g = 0, b = 0, a = 1.0) {
    super();

    if (r instanceof Float32Array) {
      this.__data = r;
    } else if (r instanceof ArrayBuffer) {
      const buffer = r;
      const byteOffset = g;
      this.__data = new Float32Array(buffer, byteOffset, 4);
    } else {
      this.__data = new Float32Array(4);
      if (typeof r == 'string') {
        if (r.startsWith('#')) {
          this.setFromHex(r);
        } else {
          this.setFromCSSColorName(r);
        }
      } else {
        this.__data[0] = r;
        this.__data[1] = g;
        this.__data[2] = b;
        this.__data[3] = a;
      }
    }
  }

  get r() {
    return this.__data[0];
  }

  set r(val) {
    this.__data[0] = val;
  }

  get g() {
    return this.__data[1];
  }

  set g(val) {
    this.__data[1] = val;
  }

  get b() {
    return this.__data[2];
  }

  set b(val) {
    this.__data[2] = val;
  }

  get a() {
    return this.__data[3];
  }

  set a(val) {
    this.__data[3] = val;
  }

  // Setter from scalar components
  set(r, g, b, a = 1.0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  setFromOther(other) {
    this.r = other.r;
    this.g = other.g;
    this.b = other.b;
    this.a = other.a;
  }

  setFromScalarArray(vals) {
    this.r = vals[0];
    this.g = vals[1];
    this.b = vals[2];
    this.a = vals.length == 4 ? vals[3] : 1.0;
  }

  getAsRGBArray() {
    return [this.r * 255, this.g * 255, this.b * 255];
  }

  getAsRGBDict() {
    return {
      r: this.r * 255,
      g: this.g * 255,
      b: this.b * 255,
    };
  }

  setFromRGB(r, g, b, a) {
    this.r = r / 255;
    this.g = g / 255;
    this.b = b / 255;
    this.a = a ? a / 255 : 1.0;
  }

  setFromRGBArray(vals) {
    this.r = vals[0] / 255;
    this.g = vals[1] / 255;
    this.b = vals[2] / 255;
    this.a = vals.length == 4 ? vals[3] / 255 : 1.0;
  }

  setFromRGBDict(vals) {
    this.r = vals.r / 255;
    this.g = vals.g / 255;
    this.b = vals.b / 255;
    this.a = vals.a == 4 ? vals.a / 255 : 1.0;
  }

  setFromHex(hex) {
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    }
    const rgb = hexToRgb(hex);
    if (!rgb) {
      console.warn('Invalid hex code:' + hex);
      return;
    }
    this.setFromRGB(rgb.r, rgb.g, rgb.b);
  }

  setFromCSSColorName(name) {
    const colourNameToHex = colour => {
      const colors = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        'indianred ': '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrodyellow: '#fafad2',
        lightgrey: '#d3d3d3',
        lightgreen: '#90ee90',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370d8',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#d87093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32',
      };

      if (typeof colors[colour.toLowerCase()] != 'undefined')
        return colors[colour.toLowerCase()];

      return false;
    };
    if (name.startsWith('#')) {
      this.setFromHex(name);
    } else {
      this.setFromHex(colourNameToHex(name));
    }
  }

  toHex() {
    function componentToHex(c) {
      const int = Math.round(c * 255);
      const hex = int.toString(16);
      return hex.length == 1 ? '0' + hex : hex;
    }
    return (
      '#' +
      componentToHex(this.r) +
      componentToHex(this.g) +
      componentToHex(this.b)
    );
  }
  // ///////////////////////////////////////

  // Returns true if this vector is the same as another one
  equal(other, precision) {
    return (
      this.r == other.r &&
      this.g == other.g &&
      this.b == other.b &&
      this.a == other.a
    );
  }

  // Returns true if this vector is the same as another one
  notequals(other, precision) {
    return (
      this.r != other.r &&
      this.g != other.g &&
      this.b != other.b &&
      this.a != other.a
    );
  }

  // Returns true if this vector is the same as another one
  // (given a precision)
  approxEqual(other) {
    return (
      Math.abs(this.r - other.r) < Number.EPSILON &&
      Math.abs(this.g - other.g) < Number.EPSILON &&
      Math.abs(this.b - other.b) < Number.EPSILON &&
      Math.abs(this.a - other.a) < Number.EPSILON
    );
  }

  // Returns a new vector which is this vector added to other
  add(other) {
    return new Color(
      this.r + other.r,
      this.g + other.g,
      this.b + other.b,
      this.a + other.a
    );
  }

  // Returns a new vector which is this vector subtracted from other
  subtract(other) {
    return new Color(
      this.r - other.r,
      this.g - other.g,
      this.b - other.b,
      this.a - other.a
    );
  }

  // Returns a new vector which is this vector scaled by scalar
  scale(scalar) {
    return new Vec4(
      this.r * scalar,
      this.g * scalar,
      this.b * scalar,
      this.a * scalar
    );
  }

  scaleInPlace(scalar) {
    this.r *= scalar;
    this.g *= scalar;
    this.b *= scalar;
    this.a *= scalar;
  }

  applyGamma(gamma) {
    this.set(
      Math.pow(this.r, gamma),
      Math.pow(this.g, gamma),
      Math.pow(this.b, gamma),
      this.a
    );
  }

  toLinear(gamma = 2.2) {
    return new Color(
      Math.pow(this.r, gamma),
      Math.pow(this.g, gamma),
      Math.pow(this.b, gamma),
      this.a
    );
  }

  toGamma(gamma = 2.2) {
    return new Color(
      Math.pow(this.r, 1.0 / gamma),
      Math.pow(this.g, 1.0 / gamma),
      Math.pow(this.b, 1.0 / gamma),
      this.a
    );
  }

  luminance() {
    return 0.2126 * this.r + 0.7152 * this.g + 0.0722 * this.b;
  }

  lerp(b, t) {
    const ar = this.r;
    const ag = this.g;
    const ab = this.b;
    const aa = this.a;
    return new Color(
      ar + t * (b.r - ar),
      ag + t * (b.g - ag),
      ab + t * (b.b - ab),
      aa + t * (b.a - aa)
    );
  }

  /**
   * Generates a random vector with the given scale
   *
   * @param {color} out the receiving vector
   * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
   * @return {color} out
   */
  static random(gammaOffset = 0.0, randomAlpha = false) {
    if (gammaOffset > 0.0) {
      return new Color(
        gammaOffset + Math.random() * (1.0 - gammaOffset),
        gammaOffset + Math.random() * (1.0 - gammaOffset),
        gammaOffset + Math.random() * (1.0 - gammaOffset),
        randomAlpha ? gammaOffset + Math.random() * (1.0 - gammaOffset) : 1.0
      );
    } else if (gammaOffset < 0.0) {
      return new Color(
        Math.random() * (1.0 + gammaOffset),
        Math.random() * (1.0 + gammaOffset),
        Math.random() * (1.0 + gammaOffset),
        randomAlpha ? Math.random() * (1.0 + gammaOffset) : 1.0
      );
    } else {
      return new Color(
        Math.random(),
        Math.random(),
        Math.random(),
        randomAlpha ? Math.random() : 1.0
      );
    }
  }

  clone() {
    return new Color(
      this.__data[0],
      this.__data[1],
      this.__data[2],
      this.__data[3]
    );
  }

  asArray() {
    return this.__data;
  }

  as3ComponentArray() {
    return [this.__data[0], this.__data[1], this.__data[2]];
  }

  // ////////////////////////////////////////
  // Static Methods

  static create(...args) {
    return new Color(...args);
  }

  static createFromFloat32Buffer(buffer, offset = 0) {
    return new Color(buffer, offset * 4); // 4 bytes per 32bit float
  }

  static numFloat32Elements() {
    return 4;
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON() {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a,
    };
  }

  fromJSON(j) {
    this.r = j.r;
    this.g = j.g;
    this.b = j.b;
    this.a = j.a;
  }

  toCSSString() {
    return (
      'rgba(' +
      Math.round(this.r * 255) +
      ', ' +
      Math.round(this.g * 255) +
      ', ' +
      Math.round(this.b * 255) +
      ', ' +
      this.a +
      ')'
    );
  }
}

typeRegistry.registerType('Color', Color);

export { Color };
// export default Color;
