import { Signal } from '../Utilities/index'
import { shaderLibrary } from './ShaderLibrary'
import { GLShader } from './GLShader.js'
import { GLTexture2D } from './GLTexture2D.js'
import { GLProbe } from './GLProbe.js'
import { GLFbo } from './GLFbo.js'
import { generateShaderGeomBinding } from './GeomShaderBinding.js'

// // https://threejs.org/examples/?q=sky#webgl_shaders_sky
// import './Shaders/zz85/sky.js';
// https://threejs.org/examples/?q=sky#webgl_shaders_sky
import './Shaders/GLSL/constants.js'
import './Shaders/GLSL/stack-gl/inverse.js'
import './Shaders/GLSL/wwwtyro/glsl-atmosphere.js'

// https://github.com/wwwtyro/glsl-atmosphere
shaderLibrary.setShaderModule(
  'sunAndSky.glsl',
  `

// https://github.com/wwwtyro/glsl-atmosphere
<%include file="wwwtyro/glsl-atmosphere.glsl"/>

uniform float unixTimeS;
uniform float latitude;
uniform float longitude;

//////////////////////////////////////////////////
// https://www.shadertoy.com/view/lss3DS [ in the comments]
// In complement : real position of sun at a given date and latitude longitude

const float 
  pi2 = 2.*PI,
  AU = 149597870.61, // Astronomical Unit = Mean distance of the earth from the sun - Km
  toRad = PI/180.,
  toDeg = 180./PI;
  
float JulianDay2000FromUnixTime(in float unixTimeS) {
  return (unixTimeS / 86400.0) - 10957.5;// = + 2440587.5-2451545;
}

vec2 SunAtTime(in float julianDay2000, in float latitude, in float longitude) {
  float zs,rightAscention, declination, sundist,
    t  = julianDay2000, //= jd - 2451545., // nb julian days since 01/01/2000 (1 January 2000 = 2451545 Julian Days)
    t0 = t/36525.,           // nb julian centuries since 2000      
    t1 = t0+1.,              // nb julian centuries since 1900
    Ls = fract(.779072+.00273790931*t)*pi2, // mean longitude of sun
    Ms = fract(.993126+.0027377785 *t)*pi2, // mean anomaly of sun
    GMST = 280.46061837 + 360.98564736629*t + (0.000387933 - t0/38710000.)*t0*t0, // Greenwich Mean Sidereal Time   
  // position of sun
    v = (.39785-.00021*t1)*sin(Ls)-.01*sin(Ls-Ms)+.00333*sin(Ls+Ms),
    u = 1.-.03349*cos(Ms)-.00014*cos(2.*Ls)+.00008*cos(Ls),
    w = -.0001-.04129 * sin(2.*Ls)+(.03211-.00008*t1)*sin(Ms)
      +.00104*sin(2.*Ls-Ms)-.00035*sin(2.*Ls+Ms);
  // calcul distance of sun
  sundist = 1.00021*sqrt(u)*AU;
  // calcul right ascention
  zs = w / sqrt(u-v*v);
  rightAscention = Ls + atan(zs/sqrt(1.-zs*zs));
  // calcul declination
  zs = v / sqrt(u);
  declination = atan(zs/sqrt(1.-zs*zs));

  // position relative to geographic location
  float
    sin_dec = sin(declination),   cos_dec = cos(declination),
    sin_lat = sin(toRad*latitude),cos_lat = cos(toRad*latitude),
    lmst = mod((GMST + longitude)/15., 24.);
  if (lmst<0.) lmst += 24.;
  lmst = toRad*lmst*15.;
  float
    ha = lmst - rightAscention,       
    elevation = asin(sin_lat * sin_dec + cos_lat * cos_dec * cos(ha)),
    azimuth   = acos((sin_dec - (sin_lat*sin(elevation))) / (cos_lat*cos(elevation)));
  
  return vec2(sin(ha)>0.? azimuth : pi2-azimuth, elevation);
}

// Note: this method _must_ be completely wrong, but for now it looks good enough. 
// 
vec3 sunPosFromPolarCoords(vec2 polar){
  float theta = polar.x;
  float phi = polar.y;
  return vec3(
    cos(theta) * cos(phi),
    sin(theta) * cos(phi),
    sin(phi)
  );
}


vec3 sunAndSky(vec3 viewVector){
  vec2 sunDirPolarCoords = SunAtTime(JulianDay2000FromUnixTime(unixTimeS), latitude, longitude);

  vec3 sunDir = sunPosFromPolarCoords(sunDirPolarCoords);
  float sunIntensity = 22.0;
  vec3 color = atmosphere(
    viewVector,                     // normalized ray direction
    vec3(0,6372e3,0),               // ray origin
    sunDir,                         // position of the sun
    sunIntensity,                   // intensity of the sun
    6371e3,                         // radius of the planet in meters
    6471e3,                         // radius of the atmosphere in meters
    vec3(5.5e-6, 13.0e-6, 22.4e-6), // Rayleigh scattering coefficient
    21e-6,                          // Mie scattering coefficient
    8e3,                            // Rayleigh scale height
    1.2e3,                          // Mie scale height
    0.758                           // Mie preferred scattering direction
  );

  // Apply exposure.
  color = 1.0 - exp(-1.0 * color);


  // Render the sun as a disk of approx 2 degrees diameter. 
  // Very hacky scattering using pow function.
  const float DEGTORAD = PI / 180.0;
  const float sunDiskSize = 5.0;
  const float sunSize = 1.0;
  float angleToSun = degrees(acos(dot(viewVector, sunDir)));
  float angleToHorison = degrees(acos(dot(viewVector, vec3(viewVector.x, 0.0, viewVector.z)))) * sign(viewVector.y);
  if(angleToSun < sunDiskSize && angleToHorison > 0.0){
    float modulator = 1.0;
    if(angleToSun > sunSize)
      modulator = pow(1.0 - ((angleToSun - sunSize)/(sunDiskSize-sunSize)), 10.0);
    if(angleToHorison < 2.0)
      modulator *= max(pow(angleToHorison/2.0, 3.0), 0.0);
    color += vec3(modulator * sunIntensity);
  }


  return color;
}
`
)

/** Class representing a sky shader.
 * @extends GLShader
 */
class SkyShader extends GLShader {
  /**
   * Create a sky shader.
   * @param {any} gl - The gl value.
   */
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'SkyShader.vertexShader',
      `
precision highp float;

<%include file="utils/quadVertexFromID.glsl"/>
<%include file="stack-gl/inverse.glsl"/>

uniform mat4 projectionMatrix;

/* VS Outputs */
varying vec2 v_texCoord;
varying vec3 v_viewPos;
 
void main()
{
  vec2 position = getQuadVertexPositionFromID();
  v_texCoord = position+0.5;
  gl_Position = vec4(position*2.0, 0.0, 1.0);

  v_viewPos = inverse(projectionMatrix) * gl_Position;
}

`
    )
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'SkyShader.fragmentShader',
      `
precision highp float;

uniform mat4 cameraMatrix;

varying vec2 v_texCoord;
varying vec3 v_viewPos;

<%include file="math/constants.glsl"/>
<%include file="sunAndSky.glsl"/>

void main() {
  vec3 viewVector = mat3(cameraMatrix) * normalize(v_viewPos);
  vec3 color = sunAndSky(viewVector);
  gl_FragColor = vec4(color, 1);
}
`
    )
  }
}

/** Class representing a sky dome shader.
 * @extends GLShader
 */
class SkyDomeShader extends GLShader {
  /**
   * Create a sky dome shader.
   * @param {any} gl - The gl value.
   */
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'SkyShader.vertexShader',
      `
precision highp float;

<%include file="utils/quadVertexFromID.glsl"/>

/* VS Outputs */
varying vec2 v_texCoord;
 
void main()
{
  vec2 position = getQuadVertexPositionFromID();
  v_texCoord = position+0.5;
  gl_Position = vec4(position*2.0, 0.0, 1.0);
}

`
    )
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'SkyShader.fragmentShader',
      `
precision highp float;

varying vec2 v_texCoord;

<%include file="math/constants.glsl"/>
<%include file="pragmatic-pbr/envmap-octahedral.glsl"/>
<%include file="sunAndSky.glsl"/>

void main() {
  vec3 viewVector = sphOctUvToDir(v_texCoord);
  vec3 color = sunAndSky(viewVector);
  gl_FragColor = vec4(color, 1);
}
`
    )
  }
}

/** Class representing a GL procedural sky.
 * @extends GLProbe
 */
class GLProceduralSky extends GLProbe {
  /**
   * Create a GL procedural sky.
   * @param {any} gl - The gl value.
   * @param {any} sky - The sky value.
   */
  constructor(gl, sky) {
    super(gl, 'EnvMap')
    this.__gl = gl
    this.__sky = sky
    this.__backgroundFocus = 0.0

    this.__srcGLTex = new GLTexture2D(gl, {
      format: 'RGBA',
      type: 'FLOAT',
      filter: 'LINEAR',
      wrap: 'CLAMP_TO_EDGE',
      width: 2048,
      height: 1024,
    })
    this.__renderSkyFbo = new GLFbo(gl, this.__srcGLTex)

    // this.convolveProbe(srcGLTex);

    this.__skyShader = new SkyShader(gl)
    const skyShaderShaderComp = this.__skyShader.compileForTarget(
      'GLProceduralSky'
    )
    this.__skyShaderBinding = generateShaderGeomBinding(
      gl,
      skyShaderShaderComp.attrs,
      gl.__quadattrbuffers,
      gl.__quadIndexBuffer
    )

    this.__skyDomeShader = new SkyDomeShader(gl)
    const skyDomeShaderComp = this.__skyDomeShader.compileForTarget(
      'GLProceduralSky'
    )
    this.__skyDomeShaderBinding = generateShaderGeomBinding(
      gl,
      skyDomeShaderComp.attrs,
      gl.__quadattrbuffers,
      gl.__quadIndexBuffer
    )

    this.__longitude = 45.527162
    this.__latitude = -73.575307

    this.updated = new Signal()

    const now = new Date()
    this.time = now.getHours() + now.getMinutes() / 60

    // this.renderSky();
  }

  /**
   * Getter for backgroundFocus.
   */
  get backgroundFocus() {
    return this.__backgroundFocus
  }

  /**
   * Setter for backgroundFocus.
   * @param {number} val - The val param.
   */
  set backgroundFocus(val) {
    this.__backgroundFocus = val
    this.updated.emit()
  }

  /**
   * Getter for longitude.
   */
  get longitude() {
    return this.__longitude
  }

  /**
   * Setter for longitude.
   * @param {number} val - The val param.
   */
  set longitude(val) {
    this.__longitude = val
    this.updated.emit()
  }

  /**
   * Getter for latitude.
   */
  get latitude() {
    return this.__latitude
  }

  /**
   * Setter for latitude.
   * @param {number} val - The val param.
   */
  set latitude(val) {
    this.__latitude = val
    this.updated.emit()
  }

  /**
   * Getter for time.
   */
  get time() {
    return this.__time
  }

  /**
   * Setter for time.
   * @param {number} val - The val param.
   */
  set time(val) {
    this.__time = val
    const t = val - 3
    const hour = Math.floor(t)
    const minutes = Math.floor((t - hour) * 60)
    // let date = new Date(2017, 2, 3, hour, minutes);
    // Note: getTime returns miliseconds, so convert to seconds.
    // this.__unixTime = Math.round(date.getTime() / 1000|0);
    this.__unixTime = (1488517200 + minutes * 60 + hour * 3600) | 0
    console.log(this.__unixTime)
    // this.renderSky();
    this.updated.emit()
  }

  /**
   * The renderSky method.
   */
  renderSky() {
    const gl = this.__gl

    const renderstate = {}
    this.__skyDomeShader.bind(renderstate, 'GLProceduralSky')
    this.__skyDomeShaderBinding.bind(renderstate)
    const unifs = renderstate.unifs

    gl.uniform1f(unifs.unixTimeS.location, this.__unixTime)
    gl.uniform1f(unifs.longitude.location, this.__longitude)
    gl.uniform1f(unifs.latitude.location, this.__latitude)

    this.__renderSkyFbo.bind()

    gl.drawQuad()

    this.convolveProbe(this.__srcGLTex)
  }

  /**
   * The draw method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate) {
    const gl = this.__gl
    const displayAtlas = false
    if (displayAtlas) {
      const screenQuad = gl.screenQuad
      screenQuad.bindShader(renderstate)
      // screenQuad.draw(renderstate, this.__srcGLTex);
      // screenQuad.draw(renderstate, this.__lodPyramid);
      screenQuad.draw(renderstate, this)
    } else {
      this.__skyShader.bind(renderstate, 'GLProceduralSky')
      const unifs = renderstate.unifs
      gl.uniform1f(unifs.unixTimeS.location, this.__unixTime)
      gl.uniform1f(unifs.longitude.location, this.__longitude)
      gl.uniform1f(unifs.latitude.location, this.__latitude)

      this.__skyShaderBinding.bind(renderstate)
      gl.drawQuad()
    }
    // else{
    //     ///////////////////
    //     this.__envMapShader.bind(renderstate, 'GLEnvMap');
    //     const unifs = renderstate.unifs;
    //     // this.__srcGLTex.bind(renderstate, renderstate.unifs.envMap.location);
    //     // this.__srcCDMTex.bind(renderstate, renderstate.unifs.envMap.location);
    //     //this.__lodPyramid.bind(renderstate, renderstate.unifs.envMap.location);
    //     this.bind(renderstate, renderstate.unifs.envMap.location);

    //     if ('focus' in unifs)
    //         gl.uniform1f(unifs.focus.location, this.__backgroundFocus);
    //     if ('exposure' in unifs)
    //         gl.uniform1f(unifs.exposure.location, renderstate.exposure);

    //     this.__shaderBinding.bind(renderstate);

    //     gl.depthMask(false);
    //     gl.drawQuad();
    // }
  }
}

export { GLProceduralSky }
