import { shaderLibrary } from '../ShaderLibrary';
import { sgFactory } from '../../SceneTree';
import { StandardSurfaceGeomDataShader } from './StandardSurfaceGeomDataShader';

class HandleGeomDataShader extends StandardSurfaceGeomDataShader {
  constructor(gl, floatGeomBuffer) {
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'HandleGeomDataShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="stack-gl/transpose.glsl"/>
<%include file="modelMatrix.glsl"/>


varying vec3 v_viewPos;
varying float v_drawItemID;

void main(void) {
    mat4 modelMatrix = getModelMatrix();
    mat4 modelViewMatrix = viewMatrix * modelMatrix;

    bool maintainScreenSize = true;// Could be passed as a flag.
    if(maintainScreenSize) {
        float dist = length((modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)));
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

    v_drawItemID = float(getId());
}
`
    );
  }
}

sgFactory.registerClass('HandleGeomDataShader', HandleGeomDataShader);

export { HandleGeomDataShader };
