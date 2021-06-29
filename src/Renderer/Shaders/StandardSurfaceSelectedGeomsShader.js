import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'
import { Registry } from '../../Registry'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

class StandardSurfaceSelectedGeomsShader extends GLShader {
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

void main(void) {
    int drawItemId = getDrawItemId();
    v_drawItemId = float(drawItemId);
    mat4 modelMatrix = getModelMatrix(drawItemId);
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    vec4 viewPos = modelViewMatrix * vec4(positions, 1.0);
    gl_Position = projectionMatrix * viewPos;

}
`
    )

    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;

varying float v_drawItemId;


<%include file="GLSLUtils.glsl"/>
<%include file="drawItemTexture.glsl"/>

#ifdef ENABLE_FLOAT_TEXTURES
vec4 getHighlightColor(int id) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 4);
}
#else

uniform vec4 highlightColor;

vec4 getHighlightColor(int id) {
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

Registry.register('StandardSurfaceSelectedGeomsShader', StandardSurfaceSelectedGeomsShader)
export { StandardSurfaceSelectedGeomsShader }
