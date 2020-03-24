import { shaderLibrary } from '../ShaderLibrary'
import { sgFactory } from '../../SceneTree/index'
import { StandardSurfaceGeomDataShader } from './StandardSurfaceGeomDataShader'

class HandleGeomDataShader extends StandardSurfaceGeomDataShader {
  constructor(gl, floatGeomBuffer) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'HandleGeomDataShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="stack-gl/transpose.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>


varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying float v_drawItemID;
varying vec3 v_worldPos;

void main(void) {
  int drawItemId = getDrawItemId();
    mat4 modelMatrix = getModelMatrix(drawItemId);
    mat4 modelViewMatrix = viewMatrix * modelMatrix;

    bool maintainScreenSize = true;// Could be passed as a flag.
    if(maintainScreenSize) {
        float dist = length(modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0));
        float sc = dist;
        mat4 scmat = mat4(
            sc, 0.0, 0.0, 0.0,
            0.0, sc, 0.0, 0.0,
            0.0, 0.0, sc, 0.0,
            0.0, 0.0, 0.0, 1.0
        );
        modelViewMatrix = modelViewMatrix * scmat;
    }

    vec4 viewPos = modelViewMatrix * vec4(positions, 1.0);
    gl_Position = projectionMatrix * viewPos;

    v_viewPos = -viewPos.xyz;

    v_drawItemID = float(getDrawItemId());
}
`
    )
  }
}

sgFactory.registerClass('HandleGeomDataShader', HandleGeomDataShader)

export { HandleGeomDataShader }
