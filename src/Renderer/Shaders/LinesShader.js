import { Color } from '../../Math/Color'
import { Registry } from '../../Registry'
import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

class LinesShader extends GLShader {
  constructor(gl) {
    super(gl, 'LinesShader')
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'LinesShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float Overlay;

<%include file="stack-gl/transpose.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_worldPos;

void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData  = getInstanceData(drawItemId);

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;
  gl_Position = modelViewProjectionMatrix * vec4(positions, 1.0);
    
  
  gl_Position.z = mix(gl_Position.z, -gl_Position.w, Overlay);
  
  vec4 pos = vec4(positions, 1.);
  v_worldPos      = (modelMatrix * pos).xyz;
}
`
    )

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'LinesShader.fragmentShader',
      `
precision highp float;


uniform color BaseColor;
uniform float Opacity;


<%include file="drawItemTexture.glsl"/>
<%include file="cutaways.glsl"/>

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

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_worldPos;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  int drawItemId = int(v_drawItemId + 0.5);
  int flags = int(v_geomItemData.r + 0.5);

  // Cutaways
  if(testFlag(flags, GEOMITEM_FLAG_CUTAWAY)) 
  {
      vec4 cutAwayData   = getCutaway(drawItemId);
      vec3 planeNormal = cutAwayData.xyz;
      float planeDist = cutAwayData.w;
      if(cutaway(v_worldPos, planeNormal, planeDist)){
          discard;
          return;
      }
  }


  fragColor = BaseColor;
  fragColor.a *= Opacity;


    
#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    )
    this.finalize()
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({ name: 'BaseColor', defaultValue: new Color(1.0, 1.0, 0.5) })
    paramDescs.push({ name: 'Opacity', defaultValue: 1.0 })
    paramDescs.push({ name: 'Overlay', defaultValue: 0.0 })
    return paramDescs
  }

  static getGeomDataShaderName() {
    return 'StandardSurfaceGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'StandardSurfaceSelectedGeomsShader'
  }

  static isTransparent() {
    return true
  }

  bind(renderstate, key) {
    if (renderstate.pass != 'ADD') return false
    return super.bind(renderstate, key)
  }
}

Registry.register('LinesShader', LinesShader)
export { LinesShader }
