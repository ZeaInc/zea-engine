
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
