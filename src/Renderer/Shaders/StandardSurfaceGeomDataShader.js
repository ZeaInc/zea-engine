import { shaderLibrary } from '../ShaderLibrary';
import { GLShader } from '../GLShader.js';
import { sgFactory } from '../../SceneTree';

import './GLSL/stack-gl/inverse.js';
import './GLSL/stack-gl/transpose.js';
import './GLSL/modelMatrix.js';
import './GLSL/glsl-bits.js';

class StandardSurfaceGeomDataShader extends GLShader {
  constructor(gl, floatGeomBuffer) {
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'StandardSurfaceGeomDataShader.vertexShader',
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
    vec4 viewPos = modelViewMatrix * vec4(positions, 1.0);
    gl_Position = projectionMatrix * viewPos;

    v_viewPos = -viewPos.xyz;

    v_drawItemID = float(getId());
}
`
    );

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'StandardSurfaceGeomDataShader.fragmentShader',
      `
precision highp float;

varying vec3 v_viewPos;
varying float v_drawItemID;
uniform int floatGeomBuffer;
uniform int passId;

<%include file="GLSLBits.glsl"/>

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif

    float dist = length(v_viewPos);

    if(floatGeomBuffer != 0) {
        fragColor.r = float(passId); 
        fragColor.g = float(v_drawItemID);
        fragColor.b = 0.0;// TODO: store poly-id or something.
        fragColor.a = dist;
    }
    else {
        ///////////////////////////////////
        // UInt8 buffer
        fragColor.r = (mod(v_drawItemID, 256.) + 0.5) / 255.;
        fragColor.g = (floor(v_drawItemID / 256.) + 0.5) / 255.;


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
    );
  }
}

sgFactory.registerClass(
  'StandardSurfaceGeomDataShader',
  StandardSurfaceGeomDataShader
);

export { StandardSurfaceGeomDataShader };
