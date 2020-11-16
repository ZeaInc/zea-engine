import { Color } from '../../Math/index'
import { Registry } from '../../Registry'
import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

class FatPointsShader extends GLShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'FatPointsShader.vertexShader',
      `
precision highp float;

instancedattribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="stack-gl/transpose.glsl"/>
<%include file="stack-gl/inverse.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>
<%include file="utils/quadVertexFromID.glsl"/>

uniform float PointSize;
uniform float Overlay;

/* VS Outputs */
varying vec2 v_texCoord;
varying vec3 v_viewPos;
varying float v_drawItemId;

void main(void) {
  int drawItemId = getDrawItemId();
  vec2 quadPointPos = getQuadVertexPositionFromID();
  v_texCoord = quadPointPos + 0.5;

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  
  vec4 viewPos = modelViewMatrix * vec4(positions, 1.);

  viewPos += vec4(vec3(quadPointPos, 0.0) * PointSize, 0.);

  // Generate a quad which is 0.5 * PointSize closer towards
  // us. This allows points to be visualized even if snug on 
  // a surface. (else they get fully clipped)
  viewPos.z += 0.5 * PointSize;

  v_drawItemId = float(getDrawItemId());
  v_viewPos = -viewPos.xyz;
  
  gl_Position = projectionMatrix * viewPos;
  if(Overlay > 0.0){
    gl_Position.z = mix(gl_Position.z, -gl_Position.w, Overlay);
  }
}
`
    )

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'FatPointsShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>

uniform color BaseColor;
uniform float Rounded;
uniform float BorderWidth;

/* VS Outputs */
varying vec2 v_texCoord;
varying vec3 v_viewPos;
varying float v_drawItemId;

#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  float dist = length(v_texCoord - 0.5);
  if(dist > 0.5)
    discard;
  if(dist > 0.5 - (BorderWidth * 0.5))
    fragColor = vec4(0.,0.,0.,1.);
  else {
    // Modulate the lighting using the texture coord so the point looks round.
    float NdotV = cos(dist * PI);

    fragColor = BaseColor * mix(1.0, NdotV, Rounded);
  }
  

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    )
  }

  bind(renderstate) {
    if (super.bind(renderstate)) {
      renderstate.supportsInstancing = false
      return true
    }
    return false
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    })
    paramDescs.push({ name: 'PointSize', defaultValue: 0.05 })
    paramDescs.push({ name: 'Rounded', defaultValue: 1.0 })
    paramDescs.push({ name: 'BorderWidth', defaultValue: 0.2 })
    paramDescs.push({ name: 'Overlay', defaultValue: 0.0 })
    return paramDescs
  }

  static getGeomDataShaderName() {
    return 'FatPointsGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'FatPointsSelectedShader'
  }
}

class FatPointsGeomDataShader extends FatPointsShader {
  constructor(gl) {
    super(gl)

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'FatPointsGeomDataShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLBits.glsl"/>

uniform int floatGeomBuffer;
uniform int passId;

/* VS Outputs */
varying vec2 v_texCoord;
varying vec3 v_viewPos;
varying float v_drawItemId;

#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  float dist = length(v_texCoord - 0.5);
  if(dist > 0.5)
    discard;
    

  float viewDist = length(v_viewPos);

  if(floatGeomBuffer != 0) {
    fragColor.r = float(passId); 
    fragColor.g = float(v_drawItemId);
    fragColor.b = 0.0;// TODO: store poly-id or something.
    fragColor.a = viewDist;
  }
  else {
    ///////////////////////////////////
    // UInt8 buffer
    fragColor.r = (mod(v_drawItemId, 256.) + 0.5) / 255.;
    fragColor.g = (floor(v_drawItemId / 256.) + 0.5) / 255.;

    // encode the dist as a 16 bit float
    vec2 float16bits = encode16BitFloatInto2xUInt8(viewDist);
    fragColor.b = float16bits.x;
    fragColor.a = float16bits.y;
  }


#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    )
  }
}

class FatPointsSelectedShader extends FatPointsShader {
  constructor(gl) {
    super(gl)

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'FatPointsSelectedShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLBits.glsl"/>

uniform int floatGeomBuffer;
uniform int passId;

/* VS Outputs */
varying vec2 v_texCoord;
varying vec3 v_viewPos;
varying float v_drawItemId;


<%include file="drawItemTexture.glsl"/>

#ifdef ENABLE_FLOAT_TEXTURES
vec4 getHighlightColor(int id) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 4);
}
#else

uniform vec4 highlightColor;

vec4 getHighlightColor() {
    return highlightColor;
}

#endif


#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  float dist = length(v_texCoord - 0.5);
  if(dist > 0.5)
    discard;
  
  int drawItemId = int(v_drawItemId + 0.5);
  fragColor = getHighlightColor(drawItemId);

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    )
  }
}

Registry.register('FatPointsShader', FatPointsShader)
Registry.register('FatPointsGeomDataShader', FatPointsGeomDataShader)
Registry.register('FatPointsSelectedShader', FatPointsSelectedShader)

// Note: due to a bug in webpack, if these classes are not exported,
// then we get a mangling of the code _only_in_release_mode_.
// The factory returns FatPointsSelectedShader
// instead of FatPointsShader when the GLPAss tries to construct it.
export { FatPointsShader, FatPointsGeomDataShader, FatPointsSelectedShader }
