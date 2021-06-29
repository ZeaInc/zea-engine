import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'
import { Registry } from '../../Registry'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'
import './GLSL/glsl-bits.js'

class StandardSurfaceGeomDataShader extends GLShader {
  constructor(gl, floatGeomBuffer) {
    super(gl)

    this.setShaderStage(
      'VERTEX_SHADER',
      `
precision highp float;

attribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="GLSLUtils.glsl"/>
<%include file="stack-gl/transpose.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>


varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_worldPos;

void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData = getInstanceData(drawItemId);

  vec4 pos = vec4(positions, 1.);
  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  vec4 viewPos = modelViewMatrix * pos;
  gl_Position = projectionMatrix * viewPos;

  v_viewPos = -viewPos.xyz;

  v_worldPos      = (modelMatrix * pos).xyz;
}
`
    )

    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;

<%include file="GLSLUtils.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="math/constants.glsl"/>
<%include file="cutaways.glsl"/>
<%include file="GLSLBits.glsl"/>

uniform int floatGeomBuffer;
uniform int passId;

#ifdef ENABLE_FLOAT_TEXTURES
vec4 getCutaway(int id) {
    return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 5);
}

#else

uniform vec4 cutawayData;

vec4 getCutaway(int id) {
    return cutawayData;
}

#endif

varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_worldPos;


#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {
  int drawItemId = int(v_drawItemId + 0.5);

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif

  int flags = int(v_geomItemData.r + 0.5);
  // Cutaways
  if(testFlag(flags, GEOMITEM_FLAG_CUTAWAY)) {
      vec4 cutAwayData   = getCutaway(drawItemId);
      vec3 planeNormal = cutAwayData.xyz;
      float planeDist = cutAwayData.w;
      if(cutaway(v_worldPos, planeNormal, planeDist)){
          discard;
          return;
      }
  }
  if(testFlag(flags, GEOMITEM_INVISIBLE_IN_GEOMDATA)) {
    discard;
    return;
  }
  

    float dist = length(v_viewPos);

    if(floatGeomBuffer != 0) {
        fragColor.r = float(passId);
        fragColor.g = float(drawItemId) - 0.1;
        fragColor.b = 0.0;// TODO: store poly-id or something.
        fragColor.a = dist;
    }
    else {
        ///////////////////////////////////
        // UInt8 buffer
        fragColor.r = mod(v_drawItemId, 256.) / 256.;
        fragColor.g = (floor(v_drawItemId / 256.) + (float(passId) * 64.)) / 256.;


        // encode the dist as a 16 bit float
        vec2 float16bits = encode16BitFloatInto2xUInt8(dist);
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

Registry.register('StandardSurfaceGeomDataShader', StandardSurfaceGeomDataShader)

export { StandardSurfaceGeomDataShader }
